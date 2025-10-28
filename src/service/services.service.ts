// src/service/services.service.ts
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
import { IOrderedForm, AnyOrderedFormInputDto, OrderedFormInputDto } from './types/service-form.types'; // Sesuaikan path jika perlu
import { getServicesWithAggregation } from './helpers/service-aggregation.helper'; // Sesuaikan path jika perlu

@Injectable()
export class ServicesService {
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
    ): Promise<any> { // Return type diubah
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

    // --- 👇 PERUBAHAN DI METODE INI 👇 ---
    async update(serviceKey: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<any> { // Ubah return type
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
        const savedNewVersion = await newVersion.save(); // Simpan versi baru

        // Ambil kembali data service yang sudah dipopulasi
        const populatedServices = await getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            { _id: savedNewVersion._id }, // Gunakan ID dari versi baru
            true
        );

        if (populatedServices.length > 0) {
            return populatedServices[0]; // Kembalikan service yang sudah dipopulasi
        } else {
            throw new NotFoundException(`Failed to retrieve the updated service with ID ${savedNewVersion._id}`);
        }
    }
    // --- 👆 PERUBAHAN DI METODE INI 👆 ---


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

    private async findAndValidatePublicService(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel.findById(id).exec();

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }

    async findAllByCompanyId(companyId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new NotFoundException(`Invalid company ID: ${companyId}`);
        }
        const latestPublicServices = await getServicesWithAggregation(
            this.serviceModel,
            this.formsService,
            {
                companyId: new Types.ObjectId(companyId),
                isActive: true,
                accessType: 'public'
            },
            false
        );
        return latestPublicServices;
    }

    async findById(id: string): Promise<any> {
        const service = await this.findAndValidatePublicService(id);

        const formQuantity = (service.workOrderForms?.length || 0) +
            (service.reportForms?.length || 0) +
            (service.clientIntakeForms?.length || 0);

        const populatedIntakeForms = await Promise.all(
            (service.clientIntakeForms || []).map(async (formInfo) => {
                try {
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);
                    if (!latestForm) return null;
                    return {
                        order: formInfo.order,
                        form: {
                            _id: latestForm._id,
                            title: latestForm.title,
                            description: latestForm.description,
                            formType: latestForm.formType,
                        }
                    };
                } catch (error) {
                    console.error(`Error fetching form template with key ${formInfo.formKey}: ${error.message}`);
                    return null;
                }
            })
        ).then(results => results.filter(f => f !== null));

        const populatedRequiredStaff = await Promise.all(
            (service.requiredStaff || []).map(async (staff) => {
                try {
                    const position = await this.serviceModel.db.collection('positions').findOne({ _id: staff.positionId });
                    return {
                        position: {
                            _id: position?._id,
                            name: position?.name
                        },
                        minimumStaff: staff.minimumStaff,
                        maximumStaff: staff.maximumStaff
                    };
                } catch (error) {
                    console.error(`Error populating position ${staff.positionId}: ${error.message}`);
                    return {
                        position: { _id: staff.positionId, name: 'Unknown Position' },
                        minimumStaff: staff.minimumStaff,
                        maximumStaff: staff.maximumStaff
                    };
                }
            })
        );

        return {
            service: {
                _id: service._id,
                companyId: service.companyId,
                title: service.title,
                description: service.description,
                accessType: service.accessType,
                isActive: service.isActive,
                requiredStaff: populatedRequiredStaff,
                clientIntakeForms: populatedIntakeForms,
            },
            formQuantity: formQuantity,
        };
    }

    async getLatestFormsForService(serviceId: string): Promise<any[]> {
        const service = await this.findAndValidatePublicService(serviceId);

        const allFormsInfo = [
            ...(service.workOrderForms || []),
            ...(service.reportForms || []),
            ...(service.clientIntakeForms || []),
        ];

        allFormsInfo.sort((a, b) => a.order - b.order);

        const populatedForms = await Promise.all(
            allFormsInfo.map(async (formInfo) => {
                try {
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);
                    if (!latestForm) {
                        console.warn(`Form template with key ${formInfo.formKey} not found for service ${serviceId}.`);
                        return null;
                    }
                    return {
                        order: formInfo.order,
                        form: latestForm,
                    };
                } catch (error) {
                    console.error(`Error processing formKey ${formInfo.formKey} for service ${serviceId}: ${error.message}`);
                    return null;
                }
            })
        );

        return populatedForms.filter(pf => pf !== null);
    }
}