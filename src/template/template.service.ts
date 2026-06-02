// src/template/template.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CompanyType,
  CompanyTypeDocument,
} from './schemas/company-type.schema';
import {
  ServiceTemplate,
  ServiceTemplateDocument,
} from './schemas/service-template.schema';
import { FormsService } from '../form/form.service';
import { ServicesInternalService } from '../service/services.internal.service';
import { PositionsService } from '../positions/positions.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(CompanyType.name)
    private companyTypeModel: Model<CompanyTypeDocument>,
    @InjectModel(ServiceTemplate.name)
    private serviceTemplateModel: Model<ServiceTemplateDocument>,
    private readonly formsService: FormsService,
    private readonly servicesService: ServicesInternalService,
    private readonly positionsService: PositionsService,
  ) {}

  // ─── GET /template/company-type ──────────────────────────────────────────────

  async getCompanyTypes() {
    const types = await this.companyTypeModel
      .find()
      .select('_id name description')
      .lean()
      .exec();
    return types.map((t) => ({
      _id: t._id,
      companyTypeName: t.name,
      description: t.description ?? null,
    }));
  }

  // ─── GET /template/company-type/:companyTypeId/services ──────────────────────

  async getServicesByCompanyType(companyTypeId: string) {
    if (!Types.ObjectId.isValid(companyTypeId)) {
      throw new NotFoundException('Invalid Company Type ID');
    }
    const companyType = await this.companyTypeModel
      .findById(companyTypeId)
      .lean()
      .exec();
    if (!companyType) {
      throw new NotFoundException('Company Type not found');
    }

    const templates = await this.serviceTemplateModel
      .find({ companyTypeId: new Types.ObjectId(companyTypeId) })
      .select('_id title description')
      .lean()
      .exec();

    return templates.map((t) => ({
      _id: t._id,
      title: t.title,
      description: t.description,
    }));
  }

  // ─── GET /template/services/:serviceTemplateId ───────────────────────────────

  async getServiceTemplatePreview(serviceTemplateId: string) {
    if (!Types.ObjectId.isValid(serviceTemplateId)) {
      throw new NotFoundException('Invalid Service Template ID');
    }
    const template = await this.serviceTemplateModel
      .findById(serviceTemplateId)
      .lean()
      .exec();
    if (!template) {
      throw new NotFoundException('Service Template not found');
    }

    // Build the "real service" preview object from the blueprint
    const service = {
      title: template.title,
      description: template.description,
      accessType: (template as any).accessType ?? 'internal',
      draftingWorkOrderType:
        (template as any).draftingWorkOrderType ?? 'manual',
      isActive: false,
      serviceRequestConfig: {
        intakeForm: template.serviceRequestConfig?.intakeForm
          ? {
              title: template.serviceRequestConfig.intakeForm.title,
              description: template.serviceRequestConfig.intakeForm.description,
              formType: template.serviceRequestConfig.intakeForm.formType,
              fields: template.serviceRequestConfig.intakeForm.fields ?? [],
            }
          : null,
        reviewForm: template.serviceRequestConfig?.reviewForm
          ? {
              title: template.serviceRequestConfig.reviewForm.title,
              description: template.serviceRequestConfig.reviewForm.description,
              formType: template.serviceRequestConfig.reviewForm.formType,
              fields: template.serviceRequestConfig.reviewForm.fields ?? [],
            }
          : null,
        serviceRequestApprovalAccessType:
          template.serviceRequestConfig?.serviceRequestApprovalAccessType ??
          ApprovalAccessType.AUTO,
        reviewNeed: template.serviceRequestConfig?.reviewNeed ?? false,
      },
      workOrdersConfig: (template.workOrdersConfig ?? []).map((cfg) => ({
        positionsOnDuty: cfg.positionsOnDuty,
        workOrderForm: cfg.workOrderForm
          ? {
              title: cfg.workOrderForm.title,
              description: cfg.workOrderForm.description,
              formType: cfg.workOrderForm.formType,
              fields: cfg.workOrderForm.fields ?? [],
            }
          : null,
        workReportForm: cfg.workReportForm
          ? {
              title: cfg.workReportForm.title,
              description: cfg.workReportForm.description,
              formType: cfg.workReportForm.formType,
              fields: cfg.workReportForm.fields ?? [],
            }
          : null,
        workOrderApprovalAccessType:
          cfg.workOrderApprovalAccessType ?? ApprovalAccessType.AUTO,
        workReportApprovalAccessType:
          cfg.workReportApprovalAccessType ?? ApprovalAccessType.AUTO,
        showReportToRequester: cfg.showReportToRequester ?? false,
        minStaff: cfg.minStaff,
        maxStaff: cfg.maxStaff,
      })),
    };

    // Collect unique position names required by this template
    const positionsRequired = (template.workOrdersConfig ?? []).map((cfg) => ({
      _id: new Types.ObjectId().toString(),
      name: cfg.positionsOnDuty?.name || 'Generated Position',
      description:
        'Posisi yang dibutuhkan untuk mengeksekusi layanan ini (ter-generate otomatis jika belum ada).',
      isActive: true,
      companyId: null,
    }));

    return {
      _id: template._id,
      service,
      positionsRequired,
    };
  }

  // ─── POST /template/services/generate ────────────────────────────────────────

  async generateServices(
    user: AuthenticatedUser,
    serviceTemplateIds: string[],
  ) {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (!serviceTemplateIds || serviceTemplateIds.length === 0) {
      throw new BadRequestException(
        'serviceTemplateIds must be a non-empty array.',
      );
    }

    const generatedServices: any[] = [];

    // Helper: create a real Form from a blueprint embedded in the template
    const createFormFromBlueprint = async (
      blueprint: any,
    ): Promise<string | null> => {
      if (!blueprint) return null;
      const form = await this.formsService.createTemplate(
        {
          title: blueprint.title,
          description: blueprint.description || '',
          formType: blueprint.formType,
          fields: blueprint.fields || [],
        },
        user,
      );
      return (form as any)._id.toString();
    };

    // Helper: get existing position by name or create a new one
    const getOrCreatePosition = async (
      positionName: string,
    ): Promise<string> => {
      const positions = await this.positionsService.findAll(user);
      const existing = positions.find(
        (p: any) => p.name.toLowerCase() === positionName.toLowerCase(),
      );
      if (existing) return (existing as any)._id.toString();

      const newPos = await this.positionsService.create(
        { name: positionName, description: 'Generated from service template' },
        user,
      );
      return (newPos as any)._id.toString();
    };

    for (const templateId of serviceTemplateIds) {
      if (!Types.ObjectId.isValid(templateId)) {
        throw new BadRequestException(`Invalid template ID: ${templateId}`);
      }

      const template = await this.serviceTemplateModel
        .findById(templateId)
        .lean()
        .exec();
      if (!template) {
        throw new NotFoundException(
          `Service template not found: ${templateId}`,
        );
      }

      // Materialise SR forms from blueprints
      const intakeFormId = await createFormFromBlueprint(
        template.serviceRequestConfig?.intakeForm,
      );
      const reviewFormId = await createFormFromBlueprint(
        template.serviceRequestConfig?.reviewForm,
      );

      // Materialise WO configs
      const workOrdersConfigDto: any[] = [];
      for (const wConfig of template.workOrdersConfig ?? []) {
        const positionId = await getOrCreatePosition(
          wConfig.positionsOnDuty?.name || 'Generated Position',
        );
        const workOrderFormId = await createFormFromBlueprint(
          wConfig.workOrderForm,
        );
        const workReportFormId = await createFormFromBlueprint(
          wConfig.workReportForm,
        );

        workOrdersConfigDto.push({
          positionId,
          workOrderFormId,
          workReportFormId,
          workOrderApprovalAccessType:
            wConfig.workOrderApprovalAccessType ?? ApprovalAccessType.AUTO,
          workReportApprovalAccessType:
            wConfig.workReportApprovalAccessType ?? ApprovalAccessType.AUTO,
          showReportToRequester: wConfig.showReportToRequester ?? false,
          minStaff: wConfig.minStaff,
          maxStaff: wConfig.maxStaff,
        });
      }

      const createServiceDto: any = {
        title: template.title,
        description: template.description,
        accessType: (template as any).accessType ?? 'internal',
        draftingWorkOrderType:
          (template as any).draftingWorkOrderType ?? 'manual',
        isActive: false, // Must be inactive until owner manually activates
        serviceRequestConfig: {
          intakeFormId,
          reviewFormId,
          serviceRequestApprovalAccessType:
            template.serviceRequestConfig?.serviceRequestApprovalAccessType ??
            ApprovalAccessType.AUTO,
          reviewNeed: template.serviceRequestConfig?.reviewNeed ?? false,
        },
        workOrdersConfig: workOrdersConfigDto,
      };

      const savedService = await this.servicesService.create(
        createServiceDto,
        user,
      );

      // Extract only summary fields
      const summary = {
        _id: savedService._id,
        companyId: savedService.companyId,
        title: savedService.title,
        description: savedService.description,
        accessType: savedService.accessType,
        isActive: savedService.isActive,
        serviceKey: savedService.serviceKey,
        createdAt: savedService.createdAt,
        updatedAt: savedService.updatedAt,
        __v: savedService.__v,
      };

      generatedServices.push(summary);
    }

    return generatedServices;
  }
}
