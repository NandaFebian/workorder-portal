// src/service/services.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { FormsService } from 'src/form/form.service';

@Injectable()
export class ServicesService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        private readonly formsService: FormsService,
    ) { }

    // ... (metode create, findAll (internal), findByVersionId, update tetap sama) ...
    async create(
        createServiceDto: CreateServiceDto,
        user: AuthenticatedUser,
    ): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        const newService = new this.serviceModel({
            ...createServiceDto,
            serviceKey: uuidv4(),
            companyId: user.company._id,
            __v: 0,
        });
        return newService.save();
    }

    async findAll(user: AuthenticatedUser): Promise<ServiceDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        return this.serviceModel.aggregate([
            { $match: { companyId: user.company._id } },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$serviceKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);
    }

    async findByVersionId(id: string, user: AuthenticatedUser): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        // Hanya populate Position
        const service = await this.serviceModel.findById(id).populate([
            { path: 'requiredStaff.positionId', select: 'name' },
            { path: 'workOrderForms.fillableByPositionIds', select: 'name' },
            { path: 'workOrderForms.viewableByPositionIds', select: 'name' },
            { path: 'reportForms.fillableByPositionIds', select: 'name' },
            { path: 'reportForms.viewableByPositionIds', select: 'name' },
            { path: 'clientIntakeForms.fillableByPositionIds', select: 'name' },
            { path: 'clientIntakeForms.viewableByPositionIds', select: 'name' },
        ]).exec();

        if (!service || service.companyId.toString() !== user.company._id.toString()) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }

    async update(serviceKey: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<ServiceDocument> {
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

        const currentIntakeForms = latestVersion.clientIntakeForms || [];
        const currentWorkOrderForms = latestVersion.workOrderForms || [];
        const currentReportForms = latestVersion.reportForms || [];

        const newVersionData = {
            ...latestVersion.toObject(),
            ...dto,
            clientIntakeForms: dto.clientIntakeForms !== undefined ? dto.clientIntakeForms : currentIntakeForms,
            workOrderForms: dto.workOrderForms !== undefined ? dto.workOrderForms : currentWorkOrderForms,
            reportForms: dto.reportForms !== undefined ? dto.reportForms : currentReportForms,
            _id: undefined,
            __v: latestVersion.__v + 1,
        };

        const newVersion = new this.serviceModel(newVersionData);
        return newVersion.save();
    }

    // --- Client Methods ---

    /**
     * Helper pribadi untuk mencari & memvalidasi service publik berdasarkan ID
     */
    private async findAndValidatePublicService(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        // --- PERUBAHAN DI SINI: Hapus populate clientIntakeForms ---
        const service = await this.serviceModel.findById(id).exec();
        // --------------------------------------------------------

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }

    async findAllByCompanyId(companyId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new NotFoundException(`Invalid company ID: ${companyId}`);
        }
        const latestPublicServices = await this.serviceModel.aggregate([
            // ... (logika agregasi tetap sama) ...
            {
                $match: {
                    companyId: new Types.ObjectId(companyId),
                    isActive: true,
                    accessType: 'public'
                }
            },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$serviceKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);

        if (latestPublicServices.length === 0) {
            return [];
        }

        return this.serviceModel.populate(latestPublicServices, [
            { path: 'requiredStaff.positionId', select: 'name' },
        ]);
    }

    /**
     * Diubah untuk endpoint: GET /public/services/{{id}}
     */
    async findById(id: string): Promise<any> {
        const service = await this.findAndValidatePublicService(id);

        const formQuantity = (service.workOrderForms?.length || 0) +
            (service.reportForms?.length || 0) +
            (service.clientIntakeForms?.length || 0);

        // --- PERUBAHAN DI SINI: Ambil form terbaru secara manual ---
        const populatedIntakeForms = await Promise.all(
            (service.clientIntakeForms || []).map(async (formInfo) => {
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
            })
        );
        // -----------------------------------------------------------

        return {
            service: {
                _id: service._id,
                companyId: service.companyId,
                title: service.title,
                description: service.description,
                accessType: service.accessType,
                isActive: service.isActive,
                clientIntakeForms: populatedIntakeForms.filter(f => f !== null), // Sertakan hasil manual populate
            },
            formQuantity: formQuantity,
        };
    }

    /**
     * Metode untuk endpoint: GET /public/services/{{id}}/forms
     * (Kode ini sudah benar karena melakukan pengambilan form manual)
     */
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
                        console.warn(`Form template with key ${formInfo.formKey} not found.`);
                        return null;
                    }

                    return {
                        order: formInfo.order,
                        form: latestForm,
                    };
                } catch (error) {
                    console.error(`Error processing formKey ${formInfo.formKey}: ${error.message}`);
                    return null;
                }
            })
        );

        return populatedForms.filter(pf => pf !== null);
    }
}