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

    /**
     * Helper method to get services with populated positions and forms
     */
    private async getServicesWithPopulatedData(
        matchQuery: any,
        includeForms: boolean = false
    ): Promise<any[]> {
        const pipeline: any[] = [
            { $match: matchQuery },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$serviceKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    accessType: 1,
                    isActive: 1,
                    requiredStaff: 1,
                    clientIntakeForms: includeForms ? 1 : 0,
                },
            },
            // Populate positions
            {
                $lookup: {
                    from: 'positions',
                    localField: 'requiredStaff.positionId',
                    foreignField: '_id',
                    as: 'requiredStaffPositions',
                },
            },
            {
                $addFields: {
                    requiredStaff: {
                        $map: {
                            input: '$requiredStaff',
                            as: 'rs',
                            in: {
                                $mergeObjects: [
                                    '$$rs',
                                    {
                                        position: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$requiredStaffPositions',
                                                        as: 'pos',
                                                        cond: { $eq: ['$$pos._id', '$$rs.positionId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            // Clean up temporary lookup and positionId
            {
                $project: {
                    requiredStaffPositions: 0,
                    'requiredStaff.positionId': 0
                }
            },
        ];

        const services = await this.serviceModel.aggregate(pipeline);

        // If forms are requested, populate them manually
        if (includeForms) {
            return Promise.all(
                services.map(async (service) => {
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
                                console.error(`Error processing formKey ${formInfo.formKey}: ${error.message}`);
                                return null;
                            }
                        })
                    );

                    return {
                        ...service,
                        clientIntakeForms: populatedIntakeForms.filter(f => f !== null),
                    };
                })
            );
        }

        return services;
    }

    async findAll(user: AuthenticatedUser): Promise<any[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        return this.getServicesWithPopulatedData(
            { companyId: user.company._id },
            true // Include forms for findAll
        );
    }

    async findByVersionId(id: string, user: AuthenticatedUser): Promise<any> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }

        const services = await this.getServicesWithPopulatedData(
            {
                _id: new Types.ObjectId(id),
                companyId: user.company._id
            },
            true // Include forms for findByVersionId
        );

        if (services.length === 0) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        return services[0];
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

        // Get populated requiredStaff data
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
                        position: {
                            _id: staff.positionId,
                            name: 'Unknown Position'
                        },
                        minimumStaff: staff.minimumStaff,
                        maximumStaff: staff.maximumStaff
                    };
                }
            })
        );

        return {
            service: {
                _id: service._id,
                title: service.title,
                description: service.description,
                accessType: service.accessType,
                isActive: service.isActive,
                requiredStaff: populatedRequiredStaff,
                clientIntakeForms: populatedIntakeForms.filter(f => f !== null),
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