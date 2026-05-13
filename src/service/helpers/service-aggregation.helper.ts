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
    draftingWorkOrderType: 1,
    createdAt: 1,
    updatedAt: 1,
    __v: 1,
  };

  if (includeForms) {
    projectStage.serviceRequestConfig = 1;
    projectStage.workOrdersConfig = 1;
  }

  // Extract base match criteria (companyId, deletedAt) to be applied before grouping
  // Other filters (isActive, accessType) must be applied after grouping to prevent fallback to old versions
  const { companyId, ...otherFilters } = matchQuery;
  const initialMatch: any = { deletedAt: null };
  if (companyId) initialMatch.companyId = companyId;

  const pipeline: PipelineStage[] = [
    { $match: initialMatch },
    { $sort: { __v: -1 } },
    {
      $group: {
        _id: '$serviceKey',
        latest_doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$latest_doc' } },
    { $match: otherFilters }, // Apply isActive, accessType, etc. on the latest version only
    { $sort: { createdAt: -1 } },
    { $project: projectStage },
  ];

  const services = await serviceModel.aggregate(pipeline);

  if (!includeForms) {
    return services;
  }

  return Promise.all(
    services.map(async (service) => {
      const resolveForm = async (formId: any) => {
        if (!formId) return null;
        try {
          let template = await formsService.findTemplateById(formId.toString());
          if (!template) return null;
          
          try {
            const latest = await formsService.findLatestTemplateByKey(template.formKey);
            if (latest) template = latest;
          } catch {
            // fallback to isolated version if latest not found
          }

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
        intakeForm: await resolveForm(src.intakeFormId),
        reviewForm: await resolveForm(src.reviewFormId),
        serviceRequestApprovalAccessType: src.serviceRequestApprovalAccessType ?? 'auto',
        reviewNeed: src.reviewNeed ?? false,
      };

      // Hydrate workOrdersConfig[]
      const rawConfigs: any[] = service.workOrdersConfig || [];
      const hydratedWorkOrdersConfig = await Promise.all(
        rawConfigs.map(async (cfg) => ({
          _id: cfg._id,
          configId: cfg.configId,
          workOrderForm: await resolveForm(cfg.workOrderFormId),
          workReportForm: await resolveForm(cfg.workReportFormId),
          positionsOnDuty: await resolvePosition(cfg.positionId),
          workOrderApprovalAccessType: cfg.workOrderApprovalAccessType,
          workReportApprovalAccessType: cfg.workReportApprovalAccessType,
          minStaff: cfg.minStaff,
          maxStaff: cfg.maxStaff,
          showReportToRequester: cfg.showReportToRequester ?? false,
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
