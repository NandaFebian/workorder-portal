import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyType, CompanyTypeDocument } from './schemas/company-type.schema';
import { ServiceTemplate, ServiceTemplateDocument } from './schemas/service-template.schema';
import { FormsService } from '../form/form.service';
import { ServicesInternalService } from '../service/services.internal.service';
import { PositionsService } from '../positions/positions.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(CompanyType.name) private companyTypeModel: Model<CompanyTypeDocument>,
    @InjectModel(ServiceTemplate.name) private serviceTemplateModel: Model<ServiceTemplateDocument>,
    private readonly formsService: FormsService,
    private readonly servicesService: ServicesInternalService,
    private readonly positionsService: PositionsService,
  ) {}

  async getCompanyTypes() {
    return this.companyTypeModel.find().exec();
  }

  async getServicesByCompanyType(companyTypeId: string) {
    if (!Types.ObjectId.isValid(companyTypeId)) {
      throw new NotFoundException('Invalid Company Type ID');
    }
    const templates = await this.serviceTemplateModel
      .find({ companyTypeId: new Types.ObjectId(companyTypeId) })
      .select('_id title description')
      .exec();
    return templates;
  }

  async getServiceTemplate(serviceTemplateId: string) {
    if (!Types.ObjectId.isValid(serviceTemplateId)) {
      throw new NotFoundException('Invalid Service Template ID');
    }
    const template = await this.serviceTemplateModel.findById(serviceTemplateId).exec();
    if (!template) {
      throw new NotFoundException('Service Template not found');
    }

    // Format to match REALSERVICESUMMARYOBJECT structure
    return {
      _id: template._id,
      title: template.title,
      description: template.description,
      companyTypeId: template.companyTypeId,
      serviceRequestConfig: {
        intakeForm: template.serviceRequestConfig?.intakeForm || null,
        reviewForm: template.serviceRequestConfig?.reviewForm || null,
        serviceRequestApprovalAccessType: template.serviceRequestConfig?.serviceRequestApprovalAccessType || 'auto',
        reviewNeed: template.serviceRequestConfig?.reviewNeed || false,
      },
      workOrdersConfig: template.workOrdersConfig?.map(cfg => ({
        configId: cfg.configId,
        positionsOnDuty: { name: cfg.positionName },
        workOrderForm: cfg.workOrderForm || null,
        workReportForm: cfg.workReportForm || null,
        workOrderApprovalAccessType: cfg.workOrderApprovalAccessType || 'auto',
        workReportApprovalAccessType: cfg.workReportApprovalAccessType || 'auto',
        minStaff: cfg.minStaff,
        maxStaff: cfg.maxStaff,
      })) || [],
    };
  }

  async generateServices(user: AuthenticatedUser, serviceTemplateIds: string[]) {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const generatedServices: any[] = [];

    // Helper to generate a form from blueprint
    const createFormFromBlueprint = async (blueprint: any) => {
      if (!blueprint) return null;
      const form = await this.formsService.createTemplate({
        title: blueprint.title,
        description: blueprint.description || '',
        formType: blueprint.formType,
        fields: blueprint.fields || [],
      }, user);
      return (form as any)._id.toString();
    };

    // Helper to get or create position
    const getOrCreatePosition = async (positionName: string) => {
      const positions = await this.positionsService.findAll(user);
      const pos = positions.find(p => p.name.toLowerCase() === positionName.toLowerCase());
      if (pos) return (pos as any)._id.toString();

      const newPos = await this.positionsService.create({ name: positionName, description: 'Generated from Template' }, user);
      return (newPos as any)._id.toString();
    };

    for (const templateId of serviceTemplateIds) {
      if (!Types.ObjectId.isValid(templateId)) continue;
      const template = await this.serviceTemplateModel.findById(templateId).exec();
      if (!template) continue;

      // Create SR forms
      const intakeFormId = await createFormFromBlueprint(template.serviceRequestConfig?.intakeForm);
      const reviewFormId = await createFormFromBlueprint(template.serviceRequestConfig?.reviewForm);

      // Create WO forms and configs
      const workOrdersConfigDto: any[] = [];
      for (const wConfig of template.workOrdersConfig || []) {
        const positionId = await getOrCreatePosition(wConfig.positionName);
        const workOrderFormId = await createFormFromBlueprint(wConfig.workOrderForm);
        const workReportFormId = await createFormFromBlueprint(wConfig.workReportForm);

        workOrdersConfigDto.push({
          positionId,
          workOrderFormId,
          workReportFormId,
          workOrderApprovalAccessType: wConfig.workOrderApprovalAccessType,
          workReportApprovalAccessType: wConfig.workReportApprovalAccessType,
          minStaff: wConfig.minStaff,
          maxStaff: wConfig.maxStaff,
        });
      }

      const createServiceDto: any = {
        title: template.title,
        description: template.description,
        accessType: 'public', // templates generate public by default or we can hardcode, let's use 'internal' for safety
        isActive: false, // Must be false according to rules
        serviceRequestConfig: {
          intakeFormId,
          reviewFormId,
          serviceRequestApprovalAccessType: template.serviceRequestConfig?.serviceRequestApprovalAccessType || 'auto',
          reviewNeed: template.serviceRequestConfig?.reviewNeed || false,
        },
        workOrdersConfig: workOrdersConfigDto,
      };
      
      // Override accessType if specified in template or fallback to internal
      createServiceDto.accessType = 'internal';

      const savedService = await this.servicesService.create(createServiceDto, user);
      generatedServices.push(savedService);
    }

    return generatedServices;
  }
}
