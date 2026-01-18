// src/service/helpers/service-aggregation.helper.ts
import { Model, PipelineStage, Types } from 'mongoose';
import { ServiceDocument } from '../schemas/service.schema';
import { FormsService } from 'src/form/form.service';

export async function getServicesWithAggregation(
    serviceModel: Model<ServiceDocument>,
    formsService: FormsService,
    matchQuery: any,
    includeForms: boolean = false
): Promise<any[]> {

    const projectStage: any = {
        _id: 1,
        companyId: 1,
        title: 1,
        description: 1,
        accessType: 1,
        isActive: 1,
        requiredStaffs: 1,
        serviceKey: 1,
    };

    if (includeForms) {
        projectStage.clientIntakeForms = 1;
        projectStage.workOrderForms = 1;
        projectStage.reportForms = 1;
    }

    const pipeline: PipelineStage[] = [
        { $match: { ...matchQuery, deletedAt: null } },
        { $sort: { __v: -1 } },
        {
            $group: {
                _id: '$serviceKey',
                latest_doc: { $first: '$$ROOT' }
            }
        },
        { $replaceRoot: { newRoot: '$latest_doc' } },
        { $project: projectStage },
        {
            $lookup: {
                from: 'positions',
                localField: 'requiredStaffs.positionId',
                foreignField: '_id',
                as: 'requiredStaffsPositions',
            },
        },
        {
            $addFields: {
                requiredStaffs: {
                    $map: {
                        input: '$requiredStaffs',
                        as: 'rs',
                        in: {
                            $mergeObjects: [
                                '$$rs',
                                {
                                    position: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$requiredStaffsPositions',
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
                requiredStaffsPositions: 0,
                'requiredStaffs.positionId': 0
            }
        },
    ];

    const services = await serviceModel.aggregate(pipeline);

    if (includeForms) {
        return Promise.all(
            services.map(async (service) => {
                const populateFormDetail = async (formInfo: any) => {
                    try {
                        const latestForm = await formsService.findLatestTemplateByKey(formInfo.formKey);
                        if (!latestForm) return null;
                        return {
                            _id: latestForm._id,
                            title: latestForm.title,
                            description: latestForm.description,
                            formType: latestForm.formType,
                        };
                    } catch (error: any) {
                        console.error(`Error processing formKey ${formInfo.formKey} in service ${service._id}: ${error.message}`);
                        return null;
                    }
                };

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

                            if (includeAccessControl) {
                                return {
                                    ...baseResult,
                                    fillableByRoles: formInfo.fillableByRoles,
                                    viewableByRoles: formInfo.viewableByRoles,
                                    fillableByPositionIds: formInfo.fillableByPositionIds,
                                    viewableByPositionIds: formInfo.viewableByPositionIds,
                                };
                            }
                            return baseResult;
                        })
                    );
                    return results.filter(f => f !== null);
                };

                const [processedIntakeForms, processedWorkOrderForms, processedReportForms] = await Promise.all([
                    processFormArray(service.clientIntakeForms, false),
                    processFormArray(service.workOrderForms, true),
                    processFormArray(service.reportForms, true)
                ]);

                delete service.clientIntakeForms;
                delete service.workOrderForms;
                delete service.reportForms;

                return {
                    ...service,
                    clientIntakeForms: processedIntakeForms,
                    workOrderForms: processedWorkOrderForms,
                    reportForms: processedReportForms,
                };
            })
        );
    }
    return services;
}