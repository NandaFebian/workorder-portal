// src/service/services.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';
import { ClientServiceRequestService } from 'src/client-service-request/client-service-request.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SubmitIntakeFormDto } from './dto/submit-intake-forms.dto'; // DTO Baru
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';

@Injectable()
export class ServicesClientService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    private readonly formsService: FormsService,
    private readonly csrService: ClientServiceRequestService,
  ) {}

  private async findAndValidatePublicService(id: string): Promise<ServiceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }
    const service = await this.serviceModel
      .findById(id)
      .select('companyId title description accessType isActive serviceRequestConfig workOrdersConfig')
      .exec();

    if (!service || !service.isActive || service.accessType !== 'public') {
      throw new NotFoundException(`Service with ID ${id} not found or is not public`);
    }
    return service;
  }

  async findAllByCompanyId(companyId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(companyId))
      throw new NotFoundException(`Invalid company ID: ${companyId}`);
    return getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      {
        companyId: new Types.ObjectId(companyId),
        isActive: true,
        accessType: 'public',
      },
      false,
    );
  }

  async findServiceDetailById(id: string): Promise<any> {
    const service = await this.findAndValidatePublicService(id);
    const configCount = (service as any).workOrdersConfig?.length || 0;

    return {
      service: {
        _id: service._id,
        companyId: service.companyId,
        title: service.title,
        description: service.description,
        accessType: service.accessType,
        isActive: service.isActive,
      },
      workOrderConfigCount: configCount,
    };
  }

  async getClientIntakeFormsForService(serviceId: string): Promise<any[]> {
    const service = await this.findAndValidatePublicService(serviceId);
    const src = (service as any).serviceRequestConfig || {};
    const intakeFormKey = src.intakeFormKey;

    if (!intakeFormKey) return [];

    try {
      const latestForm = await this.formsService.findLatestTemplateByKey(intakeFormKey);
      if (!latestForm) return [];
      return [{ form: latestForm }];
    } catch {
      return [];
    }
  }

  async processIntakeSubmission(serviceId: string, user: AuthenticatedUser, dto: any) {
    const service = await this.findAndValidatePublicService(serviceId);
    const src = (service as any).serviceRequestConfig || {};

    // Snapshot the intake form ID at time of request
    let intakeFormId: any = null;
    if (src.intakeFormKey) {
      try {
        const template = await this.formsService.findLatestTemplateByKey(src.intakeFormKey);
        if (template) intakeFormId = template._id;
      } catch {}
    }

    const newCSR = await this.csrService.create({
      serviceId: service._id as any,
      requestedBy: user._id as any,
      companyId: service.companyId as any,
      intakeFormId,
    });

    const submissions = dto.submissions || [];
    const submissionDocs: any[] = [];

    for (const submission of submissions) {
      const formTemplate = await this.formsService.findTemplateById(submission.formId);
      if (!formTemplate) {
        throw new NotFoundException(`Form template with ID ${submission.formId} not found`);
      }
      validateFormSubmission(formTemplate.fields, submission.fieldsData);
      submissionDocs.push({
        ownerId: newCSR._id,
        formId: new Types.ObjectId(submission.formId),
        submissionType: 'intake',
        submittedBy: new Types.ObjectId(user._id.toString()),
        fieldsData: submission.fieldsData,
        status: 'submitted',
        submittedAt: new Date(),
      });
    }

    if (submissionDocs.length > 0) {
      await this.submissionModel.insertMany(submissionDocs);
    }

    return newCSR;
  }
}
