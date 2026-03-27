import { Model, PipelineStage, Types } from 'mongoose';
import { ServiceDocument } from '../schemas/service.schema';
import { FormsService } from 'src/form/form.service';

export async function getServicesWithAggregation(
  serviceModel: Model<ServiceDocument>,
  formsService: FormsService,
  matchQuery: any,
  includeForms: boolean = false,
): Promise<any[]> {
  const projectStage: any = {
    _id: 1,
    companyId: 1,
    title: 1,
    description: 1,
    accessType: 1,
    isActive: 1,
    serviceKey: 1,
    createdAt: 1,
    updatedAt: 1,
    __v: 1,
  };

  if (includeForms) {
    projectStage.serviceRequestConfig = 1;
    projectStage.workOrdersConfig = 1;
  }

  const pipeline: PipelineStage[] = [
    { $match: { ...matchQuery, deletedAt: null } },
    { $sort: { __v: -1 } },
    {
      $group: {
        _id: '$serviceKey',
        latest_doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$latest_doc' } },
    { $sort: { createdAt: -1 } },
    { $project: projectStage },
  ];

  const services = await serviceModel.aggregate(pipeline);

  if (!includeForms) {
    return services;
  }

  return Promise.all(
    services.map(async (service) => {
      const resolveForm = async (formKey: string | null | undefined) => {
        if (!formKey) return null;
        try {
          const template = await formsService.findLatestTemplateByKey(formKey);
          if (!template) return null;
          const t = template.toObject ? template.toObject() : template;
          return {
            _id: t._id,
            title: t.title,
            description: t.description,
            formType: t.formType,
            fields: t.fields,
          };
        } catch {
          return null;
        }
      };

      const resolvePosition = async (positionId: any) => {
        if (!positionId) return null;
        try {
          const pos = await serviceModel.db
            .collection('positions')
            .findOne({ _id: new Types.ObjectId(positionId.toString()), deletedAt: null });
          if (!pos) return null;
          return {
            _id: pos._id,
            name: pos.name,
            description: pos.description,
            companyId: pos.companyId,
          };
        } catch {
          return null;
        }
      };

      // Hydrate serviceRequestConfig
      const src = service.serviceRequestConfig || {};
      const hydratedServiceRequestConfig = {
        intakeForm: await resolveForm(src.intakeFormKey),
        reviewForm: await resolveForm(src.reviewFormKey),
        serviceRequestApprovalAccessType: src.serviceRequestApprovalAccessType ?? 'auto',
        reviewNeed: src.reviewNeed ?? false,
      };

      // Hydrate workOrdersConfig[]
      const rawConfigs: any[] = service.workOrdersConfig || [];
      const hydratedWorkOrdersConfig = await Promise.all(
        rawConfigs.map(async (cfg) => ({
          workOrderForm: await resolveForm(cfg.workOrderFormKey),
          workReportForm: await resolveForm(cfg.workReportFormKey),
          positionsOnDuty: await resolvePosition(cfg.positionId),
          workOrderApprovalAccessType: cfg.workOrderApprovalAccessType ?? 'auto',
          workReportApprovalAccessType: cfg.workReportApprovalAccessType ?? 'auto',
          minStaff: cfg.minStaff,
          maxStaff: cfg.maxStaff,
        })),
      );

      const { serviceRequestConfig: _src, workOrdersConfig: _woc, ...rest } = service;

      return {
        ...rest,
        serviceRequestConfig: hydratedServiceRequestConfig,
        workOrdersConfig: hydratedWorkOrdersConfig,
      };
    }),
  );
}
