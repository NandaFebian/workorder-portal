import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

@Injectable()
export class ServicesInternalService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private readonly formsService: FormsService,
  ) {}

  private async resolveFormIdToKey(formId: string | undefined): Promise<string | null> {
    if (!formId) return null;
    try {
      const template = await this.formsService.findTemplateById(formId);
      return template.formKey;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`Form template with ID ${formId} not found.`);
      }
      throw error;
    }
  }

  private async buildServiceRequestConfig(configDto: any): Promise<any> {
    if (!configDto) return {};
    return {
      intakeFormKey: await this.resolveFormIdToKey(configDto.intakeFormId),
      reviewFormKey: await this.resolveFormIdToKey(configDto.reviewFormId),
      serviceRequestApprovalAccessType: configDto.serviceRequestApprovalAccessType ?? 'auto',
      reviewNeed: configDto.reviewNeed ?? false,
    };
  }

  private async buildWorkOrdersConfig(configsDto: any[]): Promise<any[]> {
    if (!configsDto || configsDto.length === 0) return [];
    return Promise.all(
      configsDto.map(async (dto) => ({
        positionId: new Types.ObjectId(dto.positionId),
        workOrderFormKey: await this.resolveFormIdToKey(dto.workOrderFormId),
        workReportFormKey: await this.resolveFormIdToKey(dto.workReportFormId),
        workOrderApprovalAccessType: dto.workOrderApprovalAccessType ?? 'auto',
        workReportApprovalAccessType: dto.workReportApprovalAccessType ?? 'auto',
        minStaff: dto.minStaff,
        maxStaff: dto.maxStaff,
      })),
    );
  }

  async create(createServiceDto: CreateServiceDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const serviceRequestConfig = await this.buildServiceRequestConfig(
      createServiceDto.serviceRequestConfig,
    );
    const workOrdersConfig = await this.buildWorkOrdersConfig(
      createServiceDto.workOrdersConfig,
    );

    const serviceToSave = new this.serviceModel({
      title: createServiceDto.title,
      description: createServiceDto.description,
      accessType: createServiceDto.accessType,
      isActive: createServiceDto.isActive ?? true,
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

    const serviceRequestConfig = dto.serviceRequestConfig
      ? await this.buildServiceRequestConfig(dto.serviceRequestConfig)
      : latestVersion.serviceRequestConfig;

    const workOrdersConfig = dto.workOrdersConfig
      ? await this.buildWorkOrdersConfig(dto.workOrdersConfig)
      : latestVersion.workOrdersConfig;

    const newVersionData = {
      ...latestVersion.toObject(),
      ...dto,
      serviceRequestConfig,
      workOrdersConfig,
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
    // (or just the latest version depending on preference, but usually business logic 
    // dictates that if a service is deactivated, all its versions are deactivated/hidden)
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
    return getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { companyId: user.company._id },
      true,
    );
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

    return services[0];
  }

  async removeById(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
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

    const deletedAt = new Date();
    service.deletedAt = deletedAt;
    await service.save();

    return { deletedAt };
  }
}
