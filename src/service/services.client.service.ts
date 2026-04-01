// src/service/services.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';
import { MembershipService } from 'src/membership/membership.service';

@Injectable()
export class ServicesClientService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    private readonly membershipService: MembershipService,
    private readonly formsService: FormsService,
    private readonly csrService: ServiceRequestService,
  ) { }

  /**
   * Validasi akses service (public / member_only)
   */
  private async findAndValidatePublicService(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<ServiceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }

    const service = await this.serviceModel
      .findById(id)
      .select(
        'companyId title description accessType isActive serviceRequestConfig workOrdersConfig',
      )
      .exec();

    if (!service || !service.isActive) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.accessType === 'public') {
      return service;
    }

    if (service.accessType === 'member_only' && user?._id) {
      const isMember = await this.membershipService.isUserSubscribed(
        user._id.toString(),
        service.companyId.toString(),
      );

      if (isMember) {
        return service;
      }
    }

    throw new NotFoundException(
      `Service with ID ${id} not found or is not accessible`,
    );
  }

  async findAllByCompanyId(
    companyId: string,
    user?: AuthenticatedUser | null,
  ): Promise<{ isSubscribed: boolean; services: any[] }> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException(`Invalid company ID: ${companyId}`);
    }

    let isSubscribed = false;

    // default hanya public
    const accessTypes: string[] = ['public'];

    // cek membership jika user login
    if (user?._id) {
      isSubscribed = await this.membershipService.isUserSubscribed(
        user._id.toString(),
        companyId,
      );

      // jika member → tambahkan member_only
      if (isSubscribed) {
        accessTypes.push('member_only');
      }
    }

    const rawServices = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      {
        companyId: new Types.ObjectId(companyId),
        isActive: true,
        accessType: { $in: accessTypes },
      },
      false,
    );

    const servicesList = rawServices.map((svc) => ({
      _id: svc._id,
      companyId: svc.companyId,
      title: svc.title,
      description: svc.description,
      accessType: svc.accessType,
      isActive: svc.isActive,
    }));

    return {
      isSubscribed,
      services: servicesList,
    };
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
      const latestForm =
        await this.formsService.findLatestTemplateByKey(intakeFormKey);
      if (!latestForm) return [];
      return [{ form: latestForm }];
    } catch {
      return [];
    }
  }

  async processIntakeSubmission(
    serviceId: string,
    user: AuthenticatedUser,
    dto: any,
  ) {
    const service = await this.findAndValidatePublicService(
      serviceId,
      user,
    );
    const src = (service as any).serviceRequestConfig || {};

    let intakeFormId: any = null;
    let reviewFormId: any = null;

    if (src.intakeFormKey) {
      try {
        const template =
          await this.formsService.findLatestTemplateByKey(
            src.intakeFormKey,
          );
        if (template) intakeFormId = template._id;
      } catch { }
    }

    if (src.reviewFormKey && src.reviewNeed) {
      try {
        const template =
          await this.formsService.findLatestTemplateByKey(
            src.reviewFormKey,
          );
        if (template) reviewFormId = template._id;
      } catch { }
    }

    const newCSR = await this.csrService.create({
      serviceId: service._id as any,
      requestedBy: user._id as any,
      companyId: service.companyId as any,
      intakeFormId,
      reviewFormId,
      serviceRequestApprovalAccessType:
        src.serviceRequestApprovalAccessType ?? 'auto',
      reviewNeed: src.reviewNeed ?? false,
    });

    const submissions = dto.submissions || [];
    const submissionDocs: any[] = [];
    let savedIntakeSubmissionId: Types.ObjectId | null = null;

    for (const submission of submissions) {
      const formTemplate = await this.formsService.findTemplateById(
        submission.formId,
      );

      if (!formTemplate) {
        throw new NotFoundException(
          `Form template with ID ${submission.formId} not found`,
        );
      }

      validateFormSubmission(
        formTemplate.fields,
        submission.fieldsData,
      );

      const subDocId = new Types.ObjectId();

      if (
        intakeFormId &&
        submission.formId === intakeFormId.toString()
      ) {
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

      if (savedIntakeSubmissionId) {
        newCSR.intakeSubmissionId = savedIntakeSubmissionId;
        await newCSR.save();
      }
    }

    return newCSR;
  }
}