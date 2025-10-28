// src/service/helpers/service-aggregation.helper.ts
import { Model, PipelineStage, Types } from 'mongoose'; // Import Types
import { ServiceDocument } from '../schemas/service.schema';
import { FormsService } from 'src/form/form.service';

export async function getServicesWithAggregation(
    serviceModel: Model<ServiceDocument>,
    formsService: FormsService,
    matchQuery: any,
    includeForms: boolean = false
): Promise<any[]> {
    const pipeline: PipelineStage[] = [
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
                companyId: 1,
                title: 1,
                description: 1,
                accessType: 1,
                isActive: 1,
                requiredStaff: 1,
                // Pastikan SEMUA array form diambil jika includeForms=true
                // karena kita butuh data akses kontrolnya nanti
                clientIntakeForms: includeForms ? 1 : 0,
                workOrderForms: includeForms ? 1 : 0,
                reportForms: includeForms ? 1 : 0,
            },
        },
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
        {
            $project: {
                requiredStaffPositions: 0,
                'requiredStaff.positionId': 0
            }
        },
    ];

    const services = await serviceModel.aggregate(pipeline);

    if (includeForms) {
        return Promise.all(
            services.map(async (service) => {
                // Helper untuk populate detail form saja
                const populateFormDetail = async (formInfo) => {
                    try {
                        const latestForm = await formsService.findLatestTemplateByKey(formInfo.formKey);
                        if (!latestForm) return null;
                        return {
                            _id: latestForm._id,
                            title: latestForm.title,
                            description: latestForm.description,
                            formType: latestForm.formType,
                        };
                    } catch (error) {
                        console.error(`Error processing formKey ${formInfo.formKey} in service ${service._id}: ${error.message}`);
                        return null;
                    }
                };

                // Helper untuk memproses array form (Intake: detail saja, Lainnya: detail + akses kontrol)
                const processFormArray = async (formInfos: any[] | undefined, includeAccessControl: boolean) => {
                    if (!formInfos) return [];
                    const results = await Promise.all(
                        formInfos.map(async (formInfo) => {
                            const formDetail = await populateFormDetail(formInfo);
                            if (!formDetail) return null;

                            const baseResult = {
                                order: formInfo.order,
                                form: formDetail,
                            };

                            // Jika perlu menyertakan akses kontrol, ambil dari data asli (formInfo)
                            if (includeAccessControl) {
                                return {
                                    ...baseResult,
                                    fillableByRoles: formInfo.fillableByRoles,
                                    viewableByRoles: formInfo.viewableByRoles,
                                    fillableByPositionIds: formInfo.fillableByPositionIds,
                                    viewableByPositionIds: formInfo.viewableByPositionIds,
                                };
                            }
                            return baseResult; // Hanya order dan form untuk Intake
                        })
                    );
                    return results.filter(f => f !== null);
                };

                // Proses setiap jenis form dengan flag akses kontrol yang sesuai
                const [processedIntakeForms, processedWorkOrderForms, processedReportForms] = await Promise.all([
                    processFormArray(service.clientIntakeForms, false), // Intake -> false
                    processFormArray(service.workOrderForms, true),    // WO -> true
                    processFormArray(service.reportForms, true)       // Report -> true
                ]);

                // Hapus array form asli dari hasil agregasi sebelum mengembalikan
                delete service.clientIntakeForms;
                delete service.workOrderForms;
                delete service.reportForms;

                return {
                    ...service, // _id, title, description, accessType, isActive, requiredStaff (populated)
                    clientIntakeForms: processedIntakeForms,
                    workOrderForms: processedWorkOrderForms,
                    reportForms: processedReportForms,
                };
            })
        );
    }

    // Jika includeForms false, hapus field form mentah sebelum dikembalikan
    return services.map(service => {
        delete service.clientIntakeForms;
        delete service.workOrderForms;
        delete service.reportForms;
        return service;
    });
}