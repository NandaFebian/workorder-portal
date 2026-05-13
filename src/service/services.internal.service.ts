import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { FormsService } from 'src/form/form.service';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';
import { Role } from 'src/common/enums/role.enum';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';

@Injectable()
export class ServicesInternalService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private readonly formsService: FormsService,
  ) { }

  /**
   * Build serviceRequestConfig.
   * When draftingWorkOrderType === 'auto', force serviceRequestApprovalAccessType to 'auto'.
   */
  private async buildServiceRequestConfig(
    configDto: any,
    draftingWorkOrderType?: string,
  ): Promise<any> {
    if (!configDto) return {};

    if (configDto.intakeFormId) {
      await this.formsService.findTemplateById(configDto.intakeFormId);
    }
    if (configDto.reviewFormId) {
      await this.formsService.findTemplateById(configDto.reviewFormId);
    }

    const isAuto = draftingWorkOrderType === 'auto';

    return {
      intakeFormId: configDto.intakeFormId ? new Types.ObjectId(configDto.intakeFormId) : null,
      reviewFormId: configDto.reviewFormId ? new Types.ObjectId(configDto.reviewFormId) : null,
      // Auto drafting locks SR approval to auto
      serviceRequestApprovalAccessType: isAuto
        ? 'auto'
        : (configDto.serviceRequestApprovalAccessType ?? 'auto'),
      reviewNeed: configDto.reviewNeed ?? false,
    };
  }

  /**
   * Build workOrdersConfig array.
   * When draftingWorkOrderType === 'auto':
   *   - Reject any non-null workOrderFormId
   *   - Force all approval access types to 'auto'
   */
  private async buildWorkOrdersConfig(
    configsDto: any[],
    draftingWorkOrderType?: string,
  ): Promise<any[]> {
    if (!configsDto || configsDto.length === 0) return [];

    const isAuto = draftingWorkOrderType === 'auto';

    return Promise.all(
      configsDto.map(async (dto) => {
        const pos = await this.serviceModel.db
          .collection('positions')
          .findOne({ _id: new Types.ObjectId(dto.positionId), deletedAt: null });

        if (!pos) {
          throw new NotFoundException(`Position with ID ${dto.positionId} not found`);
        }

        // Auto draft: workOrderFormId must be null
        if (isAuto && dto.workOrderFormId) {
          throw new BadRequestException(
            'workOrderFormId must be null when draftingWorkOrderType is auto',
          );
        }

        if (dto.workOrderFormId) {
          await this.formsService.findTemplateById(dto.workOrderFormId);
        }
        if (dto.workReportFormId) {
          await this.formsService.findTemplateById(dto.workReportFormId);
        }

        return {
          _id: dto._id ? new Types.ObjectId(dto._id) : new Types.ObjectId(),
          configId: dto.configId || uuidv4(),
          positionId: new Types.ObjectId(dto.positionId),
          workOrderFormId: isAuto ? null : (dto.workOrderFormId ? new Types.ObjectId(dto.workOrderFormId) : null),
          workReportFormId: dto.workReportFormId ? new Types.ObjectId(dto.workReportFormId) : null,
          // Auto drafting locks all approvals to auto
          workOrderApprovalAccessType: isAuto ? 'auto' : (dto.workOrderApprovalAccessType ?? 'auto'),
          workReportApprovalAccessType: isAuto ? 'auto' : (dto.workReportApprovalAccessType ?? 'auto'),
          minStaff: dto.minStaff,
          maxStaff: dto.maxStaff,
          showReportToRequester: dto.showReportToRequester ?? false,
        };
      }),
    );
  }

  async create(createServiceDto: CreateServiceDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    // Department Manager: can only create services where all WO configs match their position
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (!DepartmentAuthHelper.canCreateServiceWithConfigs(user, createServiceDto.workOrdersConfig ?? [])) {
        throw new ForbiddenException(
          'Department managers can only create services for positions in their department.',
        );
      }
    }

    const draftingWorkOrderType = createServiceDto.draftingWorkOrderType ?? 'manual';

    const serviceRequestConfig = await this.buildServiceRequestConfig(
      createServiceDto.serviceRequestConfig,
      draftingWorkOrderType,
    );
    const workOrdersConfig = await this.buildWorkOrdersConfig(
      createServiceDto.workOrdersConfig,
      draftingWorkOrderType,
    );

    const serviceToSave = new this.serviceModel({
      title: createServiceDto.title,
      description: createServiceDto.description,
      accessType: createServiceDto.accessType,
      isActive: createServiceDto.isActive ?? true,
      draftingWorkOrderType,
      serviceRequestConfig,
      workOrdersConfig,
      serviceKey: uuidv4(),
      companyId: user.company._id,
      __v: 0,
    });

    const savedService = await serviceToSave.save();

    const populatedServices = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { _id: savedService._id },
      true,
    );

    if (populatedServices.length > 0) {
      return populatedServices[0];
    }

    throw new NotFoundException(
      `Failed to retrieve the created service with ID ${savedService._id}`,
    );
  }

  async update(serviceKey: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const latestVersion = await this.serviceModel
      .findOne({ serviceKey, companyId: user.company._id })
      .sort({ __v: -1 })
      .exec();

    if (!latestVersion) {
      throw new NotFoundException(`Service with key ${serviceKey} not found`);
    }

    // Department Manager: can only update if all WO configs match their position
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (!DepartmentAuthHelper.canManageService(user, latestVersion.workOrdersConfig ?? [])) {
        throw new ForbiddenException(
          'Department managers can only update services where all departments match their position.',
        );
      }
    }

    // Determine the effective draftingWorkOrderType for this update
    const draftingWorkOrderType = dto.draftingWorkOrderType ?? (latestVersion as any).draftingWorkOrderType ?? 'manual';

    const serviceRequestConfig = dto.serviceRequestConfig
      ? await this.buildServiceRequestConfig(dto.serviceRequestConfig, draftingWorkOrderType)
      : latestVersion.serviceRequestConfig;

    const workOrdersConfig = dto.workOrdersConfig
      ? await this.buildWorkOrdersConfig(dto.workOrdersConfig, draftingWorkOrderType)
      : latestVersion.workOrdersConfig;

    const { isActive: _, ...updateData } = dto as any;

    const newVersionData = {
      ...latestVersion.toObject(),
      ...updateData,
      draftingWorkOrderType,
      serviceRequestConfig,
      workOrdersConfig,
      isActive: latestVersion.isActive,
      _id: undefined,
      __v: latestVersion.__v + 1,
    };

    const newVersion = new this.serviceModel(newVersionData);
    const savedNewVersion = await newVersion.save();

    const populatedServices = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { _id: savedNewVersion._id },
      true,
    );

    if (populatedServices.length > 0) {
      return populatedServices[0];
    }

    throw new NotFoundException(
      `Failed to retrieve the updated service with ID ${savedNewVersion._id}`,
    );
  }

  async updateById(id: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }

    const service = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(id), companyId: user.company._id, deletedAt: null })
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Department Manager: verify access before proceeding
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (!DepartmentAuthHelper.canManageService(user, service.workOrdersConfig ?? [])) {
        throw new ForbiddenException(
          'Department managers can only update services where all departments match their position.',
        );
      }
    }

    const latestVersion = (await this.serviceModel
      .findOne({ serviceKey: service.serviceKey, companyId: user.company._id })
      .sort({ __v: -1 })
      .exec()) as any;

    if (latestVersion && latestVersion._id.toString() !== id) {
      throw new UnprocessableEntityException(
        `Cannot edit this service. A newer version exists. Please refresh to edit the latest version.`,
      );
    }

    return this.update(service.serviceKey, dto, user);
  }

  async toggleActive(id: string, isActive: boolean, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }

    const service = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(id), companyId: user.company._id, deletedAt: null })
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Update all versions of this service key to match the active state
    await this.serviceModel.updateMany(
      { serviceKey: service.serviceKey, companyId: user.company._id },
      { $set: { isActive } }
    );

    const populatedServices = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { _id: new Types.ObjectId(id) },
      true,
    );

    if (populatedServices.length > 0) {
      return populatedServices[0];
    }

    return service;
  }

  async findAll(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const query: any = { companyId: user.company._id };

    if (user.role === Role.CompanyStaff) {
      query.accessType = 'internal';
      query.isActive = true;
    }

    const services = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      query,
      true,
    );

    // Department Manager: filter to only services matching their position
    return DepartmentAuthHelper.filterServicesForUser(user, services);
  }

  async findByVersionId(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }

    const services = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { _id: new Types.ObjectId(id), companyId: user.company._id },
      true,
    );

    if (services.length === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const service = services[0];

    // Department Manager: verify access
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (!DepartmentAuthHelper.canManageService(user, service.workOrdersConfig ?? [])) {
        throw new ForbiddenException(
          'Department managers can only view services where all departments match their position.',
        );
      }
    }

    return service;
  }

  async removeById(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service ID: ${id}`);
    }

    // Capture the populated service before soft-deleting it
    const services = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { _id: new Types.ObjectId(id), companyId: user.company._id },
      true,
    );

    if (services.length === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const serviceDetails = services[0];

    // Department Manager: verify access before deleting
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (!DepartmentAuthHelper.canManageService(user, serviceDetails.workOrdersConfig ?? [])) {
        throw new ForbiddenException(
          'Department managers can only delete services where all departments match their position.',
        );
      }
    }

    const service = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(id), companyId: user.company._id, deletedAt: null })
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const latestVersion = (await this.serviceModel
      .findOne({ serviceKey: service.serviceKey, companyId: user.company._id, deletedAt: null })
      .sort({ __v: -1 })
      .exec()) as any;

    if (latestVersion && latestVersion._id.toString() !== id) {
      throw new UnprocessableEntityException(
        'Hanya versi service terbaru yang dapat dihapus. Silakan muat ulang untuk mendapatkan versi terakhir.',
      );
    }

    const deletedAt = new Date();
    await this.serviceModel.updateMany(
      { serviceKey: service.serviceKey, companyId: user.company._id, deletedAt: null },
      { $set: { deletedAt } }
    );

    return {
      ...serviceDetails,
      deletedAt,
    };
  }
}
