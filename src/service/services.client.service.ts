// src/service/services.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SubmitIntakeFormDto } from './dto/submit-intake-forms.dto'; // DTO Baru
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';
import { MembershipCode, MembershipCodeDocument } from 'src/membership/schemas/membership.schema';

@Injectable()
export class ServicesClientService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    @InjectModel(MembershipCode.name)
    private membershipModel: Model<MembershipCodeDocument>,
    private readonly formsService: FormsService,
    private readonly csrService: ServiceRequestService,
  ) {}

  private async isUserCompanyMember(userId: string, companyId: string): Promise<boolean> {
    if (!userId || !companyId || !Types.ObjectId.isValid(companyId) || !Types.ObjectId.isValid(userId)) {
      return false;
    }
    const membership = await this.membershipModel.findOne({
      companyId: new Types.ObjectId(companyId),
      claimedBy: new Types.ObjectId(userId),
      deletedAt: null,
    });
    return !!membership;
  }

  private async findAndValidatePublicService(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<ServiceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }
    const service = await this.serviceModel
      .findById(id)
      .select('companyId title description accessType isActive serviceRequestConfig workOrdersConfig')
      .exec();

    if (!service || !service.isActive) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.accessType === 'public') {
      return service;
    }

    if (service.accessType === 'member_only' && user) {
      const isMember = await this.isUserCompanyMember(
        user._id.toString(),
        service.companyId.toString(),
      );
      if (isMember) {
        return service;
      }
    }

    throw new NotFoundException(`Service with ID ${id} not found or is not accessible`);
  }

  async findAllByCompanyId(
    companyId: string,
    user?: AuthenticatedUser | null,
  ): Promise<any[]> {
    if (!Types.ObjectId.isValid(companyId))
      throw new NotFoundException(`Invalid company ID: ${companyId}`);

    const accessTypes = ['public'];
    if (user) {
      const isMember = await this.isUserCompanyMember(
        user._id.toString(),
        companyId,
      );
      if (isMember) {
        accessTypes.push('member_only');
      }
    }

    return getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      {
        companyId: new Types.ObjectId(companyId),
        isActive: true,
        accessType: { $in: accessTypes },
      },
      false,
    );
  }

  async findServiceDetailById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<any> {
    const service = await this.findAndValidatePublicService(id, user);
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

  async getClientIntakeFormsForService(
    serviceId: string,
    user?: AuthenticatedUser | null,
  ): Promise<any[]> {
    const service = await this.findAndValidatePublicService(serviceId, user);
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
    const service = await this.findAndValidatePublicService(serviceId, user);
    const src = (service as any).serviceRequestConfig || {};

    // Snapshot both intake and review form IDs
    let intakeFormId: any = null;
    let reviewFormId: any = null;
    
    if (src.intakeFormKey) {
      try {
        const template = await this.formsService.findLatestTemplateByKey(src.intakeFormKey);
        if (template) intakeFormId = template._id;
      } catch {}
    }
    
    if (src.reviewFormKey && src.reviewNeed) {
      try {
        const template = await this.formsService.findLatestTemplateByKey(src.reviewFormKey);
        if (template) reviewFormId = template._id;
      } catch {}
    }

    const newCSR = await this.csrService.create({
      serviceId: service._id as any,
      requestedBy: user._id as any,
      companyId: service.companyId as any,
      intakeFormId,
      reviewFormId,
    });

    const submissions = dto.submissions || [];
    const submissionDocs: any[] = [];
    let savedIntakeSubmissionId: Types.ObjectId | null = null;

    for (const submission of submissions) {
      const formTemplate = await this.formsService.findTemplateById(submission.formId);
      if (!formTemplate) {
        throw new NotFoundException(`Form template with ID ${submission.formId} not found`);
      }
      validateFormSubmission(formTemplate.fields, submission.fieldsData);
      
      const subDocId = new Types.ObjectId();
      if (intakeFormId && submission.formId === intakeFormId.toString()) {
        savedIntakeSubmissionId = subDocId;
      }
      
      submissionDocs.push({
        _id: subDocId,
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
      
      // Update the Service Request with the new submission ID
      if (savedIntakeSubmissionId) {
        newCSR.intakeSubmissionId = savedIntakeSubmissionId;
        await newCSR.save();
      }
    }

    return newCSR;
  }
}
