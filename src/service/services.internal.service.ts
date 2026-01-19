// src/service/services.internal.service.ts
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
import { FormTemplateDocument } from 'src/form/schemas/form-template.schema';
import { IOrderedForm, AnyOrderedFormInputDto, OrderedFormInputDto } from './types/service-form.types';
import { getServicesWithAggregation } from './helpers/service-aggregation.helper';

@Injectable()
export class ServicesInternalService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        private readonly formsService: FormsService,
    ) { }

    private async transformFormIdToKeyArray(formDtos: AnyOrderedFormInputDto[] | undefined): Promise<IOrderedForm[]> {
        if (!formDtos || formDtos.length === 0) {
            return [];
        }

        const transformedForms = await Promise.all(
            formDtos.map(async (dto: AnyOrderedFormInputDto): Promise<IOrderedForm> => {
                let formTemplate: FormTemplateDocument;
                try {
                    formTemplate = await this.formsService.findTemplateById(dto.formId);
                } catch (error) {
                    if (error instanceof NotFoundException) {
                        throw new BadRequestException(`Form template with ID ${dto.formId} not found.`);
                    }
                    throw error;
                }

                const hasAccessControl = 'fillableByRoles' in dto || 'fillableByPositionIds' in dto;
                const dtoWithAccess = hasAccessControl ? (dto as OrderedFormInputDto) : null;

                return {
                    order: dto.order,
                    formKey: formTemplate.formKey,
                    fillableByRoles: dtoWithAccess?.fillableByRoles || [],
                    viewableByRoles: dtoWithAccess?.viewableByRoles || [],
                    fillableByPositionIds: (dtoWithAccess?.fillableByPositionIds || []).map(id => new Types.ObjectId(id)),
                    viewableByPositionIds: (dtoWithAccess?.viewableByPositionIds || []).map(id => new Types.ObjectId(id)),
                };
            })
        );
        return transformedForms;
    }

    async create(
        createServiceDto: CreateServiceDto,
        user: AuthenticatedUser,
    ): Promise<any> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const workOrderFormsWithKeys = await this.transformFormIdToKeyArray(createServiceDto.workOrderForms);
        const reportFormsWithKeys = await this.transformFormIdToKeyArray(createServiceDto.reportForms);
        const clientIntakeFormsWithKeys = await this.transformFormIdToKeyArray(createServiceDto.clientIntakeForms);

        const serviceToSave = new this.serviceModel({
            ...createServiceDto,
            workOrderForms: workOrderFormsWithKeys,
            reportForms: reportFormsWithKeys,
            clientIntakeForms: clientIntakeFormsWithKeys,
            serviceKey: uuidv4(),
            companyId: user.company._id,
            __v: 0,
        });

        const savedService = await serviceToSave.save();

        const populatedServices = await getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            { _id: savedService._id },
            true
        );

        if (populatedServices.length > 0) {
            return populatedServices[0];
        } else {
            throw new NotFoundException(`Failed to retrieve the created service with ID ${savedService._id}`);
        }
    }

    async update(serviceKey: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<any> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        const latestVersion = await this.serviceModel.findOne({
            serviceKey,
            companyId: user.company._id
        }).sort({ __v: -1 }).exec();

        if (!latestVersion) {
            throw new NotFoundException(`Service with key ${serviceKey} not found`);
        }

        const currentIntakeForms: IOrderedForm[] = (latestVersion.clientIntakeForms as unknown as IOrderedForm[]) || [];
        const currentWorkOrderForms: IOrderedForm[] = (latestVersion.workOrderForms as unknown as IOrderedForm[]) || [];
        const currentReportForms: IOrderedForm[] = (latestVersion.reportForms as unknown as IOrderedForm[]) || [];

        const clientIntakeFormsData = dto.clientIntakeForms
            ? await this.transformFormIdToKeyArray(dto.clientIntakeForms)
            : currentIntakeForms;
        const workOrderFormsData = dto.workOrderForms
            ? await this.transformFormIdToKeyArray(dto.workOrderForms)
            : currentWorkOrderForms;
        const reportFormsData = dto.reportForms
            ? await this.transformFormIdToKeyArray(dto.reportForms)
            : currentReportForms;

        const newVersionData = {
            ...latestVersion.toObject(),
            ...dto,
            clientIntakeForms: clientIntakeFormsData,
            workOrderForms: workOrderFormsData,
            reportForms: reportFormsData,
            _id: undefined,
            __v: latestVersion.__v + 1,
        };

        const newVersion = new this.serviceModel(newVersionData);
        const savedNewVersion = await newVersion.save();

        const populatedServices = await getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            { _id: savedNewVersion._id },
            true
        );

        if (populatedServices.length > 0) {
            return populatedServices[0];
        } else {
            throw new NotFoundException(`Failed to retrieve the updated service with ID ${savedNewVersion._id}`);
        }
    }

    async updateById(id: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<any> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        // First, find the service by ID to get its serviceKey
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }

        const service = await this.serviceModel.findOne({
            _id: new Types.ObjectId(id),
            companyId: user.company._id,
            deletedAt: null
        }).exec();

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        // Now call the existing update method with serviceKey
        return this.update(service.serviceKey, dto, user);
    }

    async findAll(user: AuthenticatedUser): Promise<any[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        return getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            { companyId: user.company._id },
            true
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
            {
                _id: new Types.ObjectId(id),
                companyId: user.company._id
            },
            true
        );

        if (services.length === 0) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        return services[0];
    }

    async removeById(id: string, user: AuthenticatedUser): Promise<void> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        // First, find the service by ID to get its serviceKey
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }

        const service = await this.serviceModel.findOne({
            _id: new Types.ObjectId(id),
            companyId: user.company._id,
            deletedAt: null
        }).exec();

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }


        // Soft delete only this specific version
        service.deletedAt = new Date();
        await service.save();
    }
}