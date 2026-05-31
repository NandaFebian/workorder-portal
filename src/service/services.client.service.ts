// src/service/services.client.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
  ) {}

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

    // 1. Find the requested service version
    const requestedService = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(id), deletedAt: null })
      .exec();

    if (!requestedService) {
      throw new NotFoundException(`Service not found`);
    }

    // 2. Find the absolute latest version for this serviceKey
    const latestVersion = await this.serviceModel
      .findOne({ serviceKey: requestedService.serviceKey })
      .sort({ __v: -1 })
      .exec();

    // 3. Check if latest version is active and not deleted
    if (
      !latestVersion ||
      latestVersion.deletedAt !== null ||
      !latestVersion.isActive
    ) {
      throw new NotFoundException(
        `Service is currently inactive or has been deleted`,
      );
    }

    // 5. Access Control
    if (latestVersion.accessType === 'public') {
      return latestVersion;
    }

    if (latestVersion.accessType === 'member_only' && user?._id) {
      const isMember = await this.membershipService.isUserSubscribed(
        user._id.toString(),
        latestVersion.companyId.toString(),
      );

      if (isMember) {
        return latestVersion;
      }
    }

    throw new ForbiddenException(
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
      price: svc.price ?? null,
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

    const priceDoc = await this.serviceModel.db
      .collection('serviceprices')
      .findOne({ serviceKey: service.serviceKey, deletedAt: null });
    const price = priceDoc ? priceDoc.price : null;

    return {
      service: {
        _id: service._id,
        companyId: service.companyId,
        title: service.title,
        description: service.description,
        accessType: service.accessType,
        isActive: service.isActive,
        price,
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
    const intakeFormId = src.intakeFormId;

    if (!intakeFormId) return [];

    try {
      const specificForm = await this.formsService.findTemplateById(
        intakeFormId.toString(),
      );
      if (!specificForm) return [];
      const form = await this.formsService.findLatestTemplateByKey(
        specificForm.formKey,
      );
      if (!form) return [];
      return [{ form }];
    } catch {
      return [];
    }
  }

  async processIntakeSubmission(
    serviceId: string,
    user: AuthenticatedUser,
    dto: any,
  ) {
    const service = await this.findAndValidatePublicService(serviceId, user);
    const src = (service as any).serviceRequestConfig || {};

    let intakeFormId: any = src.intakeFormId || null;
    let reviewFormId: any =
      src.reviewFormId && src.reviewNeed ? src.reviewFormId : null;

    if (intakeFormId) {
      try {
        const sf = await this.formsService.findTemplateById(
          intakeFormId.toString(),
        );
        if (sf) {
          const lf = await this.formsService.findLatestTemplateByKey(
            sf.formKey,
          );
          if (lf) intakeFormId = lf._id;
        }
      } catch {}
    }

    if (reviewFormId) {
      try {
        const sf = await this.formsService.findTemplateById(
          reviewFormId.toString(),
        );
        if (sf) {
          const lf = await this.formsService.findLatestTemplateByKey(
            sf.formKey,
          );
          if (lf) reviewFormId = lf._id;
        }
      } catch {}
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

    // Only accept a single submission object, strictly for the intake form
    const submission = dto || null;

    if (submission) {
      if (!intakeFormId) {
        throw new NotFoundException(
          'This service does not have an intake form.',
        );
      }

      let isValidForm = false;
      try {
        const submittedForm = await this.formsService.findTemplateById(
          submission.formId,
        );
        const expectedForm = await this.formsService.findTemplateById(
          intakeFormId.toString(),
        );
        if (
          submittedForm &&
          expectedForm &&
          submittedForm.formKey === expectedForm.formKey
        ) {
          isValidForm = true;
        }
      } catch {}

      if (!isValidForm) {
        throw new NotFoundException(
          `Submitted form ID ${submission.formId} does not match the required intake form for this service.`,
        );
      }

      submission.formId = intakeFormId.toString();

      const formTemplate = await this.formsService.findTemplateById(
        intakeFormId.toString(),
      );
      if (!formTemplate) {
        throw new NotFoundException(`Intake form template not found`);
      }

      validateFormSubmission(formTemplate.fields, submission.fieldsData);

      const subDocId = new Types.ObjectId();
      await this.submissionModel.insertMany([
        {
          _id: subDocId,
          ownerId: newCSR._id,
          formId: new Types.ObjectId(intakeFormId.toString()),
          submissionType: 'intake',
          submittedBy: new Types.ObjectId(user._id.toString()),
          fieldsData: submission.fieldsData,
          status: 'submitted',
          submittedAt: new Date(),
        },
      ]);

      newCSR.intakeSubmissionId = subDocId;
      await newCSR.save();
    }

    return newCSR;
  }
}
