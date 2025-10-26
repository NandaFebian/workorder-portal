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
        private readonly formsService: FormsService, // Pastikan FormsService di-inject
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
                    companyId: 1, // Pastikan companyId disertakan
                    title: 1,
                    description: 1,
                    accessType: 1,
                    isActive: 1,
                    requiredStaff: 1,
                    clientIntakeForms: includeForms ? 1 : 0,
                    workOrderForms: includeForms ? 1 : 0, // Include jika perlu
                    reportForms: includeForms ? 1 : 0,    // Include jika perlu
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
                    const populateForms = async (formInfos) => {
                        return Promise.all(
                            (formInfos || []).map(async (formInfo) => {
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
                                            // Sertakan field lain jika perlu dari FormTemplateDocument
                                        }
                                        // Sertakan properti lain dari formInfo jika perlu (misal: fillableByRoles)
                                    };
                                } catch (error) {
                                    console.error(`Error processing formKey ${formInfo.formKey}: ${error.message}`);
                                    return null; // Return null or handle error differently
                                }
                            })
                        ).then(results => results.filter(f => f !== null)); // Filter out null results
                    };

                    const [populatedIntakeForms, populatedWorkOrderForms, populatedReportForms] = await Promise.all([
                        populateForms(service.clientIntakeForms),
                        populateForms(service.workOrderForms),
                        populateForms(service.reportForms)
                    ]);


                    return {
                        ...service,
                        clientIntakeForms: populatedIntakeForms,
                        workOrderForms: populatedWorkOrderForms,
                        reportForms: populatedReportForms,
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

        // Ambil data form yang ada, atau array kosong jika tidak ada
        const currentIntakeForms = latestVersion.clientIntakeForms || [];
        const currentWorkOrderForms = latestVersion.workOrderForms || [];
        const currentReportForms = latestVersion.reportForms || [];

        const newVersionData = {
            ...latestVersion.toObject(), // Ambil semua field dari versi lama
            ...dto, // Timpa dengan data dari DTO
            // Pastikan field form tidak hilang jika tidak ada di DTO
            clientIntakeForms: dto.clientIntakeForms !== undefined ? dto.clientIntakeForms : currentIntakeForms,
            workOrderForms: dto.workOrderForms !== undefined ? dto.workOrderForms : currentWorkOrderForms,
            reportForms: dto.reportForms !== undefined ? dto.reportForms : currentReportForms,
            _id: undefined, // Hapus _id agar Mongoose membuat _id baru
            __v: latestVersion.__v + 1, // Tingkatkan versi
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
        // Tidak perlu populate form di sini, akan dilakukan manual di findById
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
        // Gunakan getServicesWithPopulatedData tanpa menyertakan form detail
        const latestPublicServices = await this.getServicesWithPopulatedData(
            {
                companyId: new Types.ObjectId(companyId),
                isActive: true,
                accessType: 'public'
            },
            false // Tidak perlu include form detail di sini
        );

        return latestPublicServices; // requiredStaff sudah di-populate oleh getServicesWithPopulatedData
    }

    /**
     * Diubah untuk endpoint: GET /public/services/{{id}}
     */
    async findById(id: string): Promise<any> {
        const service = await this.findAndValidatePublicService(id);

        // Hitung jumlah semua jenis form
        const formQuantity = (service.workOrderForms?.length || 0) +
            (service.reportForms?.length || 0) +
            (service.clientIntakeForms?.length || 0);

        // --- Ambil form terbaru secara manual untuk clientIntakeForms ---
        const populatedIntakeForms = await Promise.all(
            (service.clientIntakeForms || []).map(async (formInfo) => {
                try {
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);
                    if (!latestForm) return null; // Jika form tidak ditemukan
                    return {
                        order: formInfo.order,
                        form: {
                            _id: latestForm._id,
                            title: latestForm.title,
                            description: latestForm.description,
                            formType: latestForm.formType,
                            // Tambahkan field lain jika perlu
                        }
                    };
                } catch (error) {
                    // Log error atau handle sesuai kebutuhan
                    console.error(`Error fetching form template with key ${formInfo.formKey}: ${error.message}`);
                    return null;
                }
            })
        ).then(results => results.filter(f => f !== null)); // Filter hasil null
        // -----------------------------------------------------------

        // Populate requiredStaff (jika belum dilakukan oleh helper, atau jika perlu format berbeda)
        // Jika getServicesWithPopulatedData sudah melakukannya, bagian ini bisa disederhanakan/dihapus
        const populatedRequiredStaff = await Promise.all(
            (service.requiredStaff || []).map(async (staff) => {
                try {
                    // Contoh: Menggunakan Mongoose populate jika findAndValidatePublicService tidak populate
                    // Atau ambil manual jika struktur berbeda
                    const position = await this.serviceModel.db.collection('positions').findOne({ _id: staff.positionId }); // Contoh manual fetch
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
                    // Handle error, misalnya kembalikan data default
                    return {
                        position: { _id: staff.positionId, name: 'Unknown Position' },
                        minimumStaff: staff.minimumStaff,
                        maximumStaff: staff.maximumStaff
                    };
                }
            })
        );

        // --- 👇 Struktur Response Sesuai Permintaan 👇 ---
        return {
            service: {
                _id: service._id,
                companyId: service.companyId, // <--- Penambahan companyId
                title: service.title,
                description: service.description,
                accessType: service.accessType,
                isActive: service.isActive,
                requiredStaff: populatedRequiredStaff, // Sertakan data staff yang sudah di-populate
                clientIntakeForms: populatedIntakeForms, // Sertakan form intake yang sudah di-populate
                // Anda bisa memilih untuk tidak menyertakan workOrderForms dan reportForms di sini jika tidak perlu
            },
            formQuantity: formQuantity, // Jumlah total form
        };
        // --- 👆 Struktur Response Sesuai Permintaan 👆 ---
    }


    /**
     * Metode untuk endpoint: GET /public/services/{{id}}/intake-forms
     */
    async getLatestFormsForService(serviceId: string): Promise<any[]> {
        const service = await this.findAndValidatePublicService(serviceId);

        // Gabungkan semua info form (work order, report, intake)
        const allFormsInfo = [
            ...(service.workOrderForms || []),
            ...(service.reportForms || []),
            ...(service.clientIntakeForms || []),
        ];

        // Urutkan berdasarkan 'order'
        allFormsInfo.sort((a, b) => a.order - b.order);

        // Ambil detail form terbaru untuk setiap formKey
        const populatedForms = await Promise.all(
            allFormsInfo.map(async (formInfo) => {
                try {
                    const latestForm = await this.formsService.findLatestTemplateByKey(formInfo.formKey);

                    if (!latestForm) {
                        console.warn(`Form template with key ${formInfo.formKey} not found for service ${serviceId}.`);
                        return null; // Abaikan jika form tidak ditemukan
                    }

                    // Kembalikan struktur yang menyertakan order dan detail form
                    return {
                        order: formInfo.order,
                        form: latestForm, // Kembalikan seluruh objek FormTemplateDocument terbaru
                        // Anda bisa menambahkan properti lain dari formInfo jika perlu
                        // fillableByRoles: formInfo.fillableByRoles,
                        // viewableByRoles: formInfo.viewableByRoles,
                        // fillableByPositionIds: formInfo.fillableByPositionIds,
                        // viewableByPositionIds: formInfo.viewableByPositionIds,
                    };
                } catch (error) {
                    console.error(`Error processing formKey ${formInfo.formKey} for service ${serviceId}: ${error.message}`);
                    return null; // Abaikan jika terjadi error saat fetch form
                }
            })
        );

        // Filter hasil yang null (jika ada form yang tidak ditemukan atau error)
        return populatedForms.filter(pf => pf !== null);
    }
}