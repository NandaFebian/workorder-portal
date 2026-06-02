import { Model, PipelineStage, Types } from 'mongoose';
import { ServiceDocument } from '../schemas/service.schema';

export async function getServicesWithAggregation(
  serviceModel: Model<ServiceDocument>,
  _formsService: any,
  matchQuery: any,
  includeForms: boolean = false,
): Promise<any[]> {
  const projectStage: any = {
    _id: 1,
    serviceKey: 1,
    companyId: 1,
    title: 1,
    description: 1,
    accessType: 1,
    isActive: 1,
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
    { $match: otherFilters },
    {
      $lookup: {
        from: 'serviceprices',
        let: { svcKey: '$serviceKey' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$serviceKey', '$$svcKey'] },
              deletedAt: null,
            },
          },
          { $limit: 1 },
        ],
        as: '_priceDoc',
      },
    },
    {
      $addFields: {
        price: { $ifNull: [{ $arrayElemAt: ['$_priceDoc.price', 0] }, null] },
      },
    },
    { $project: { ...projectStage, price: 1 } },
    { $sort: { createdAt: -1 } },
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
          // Query directly without deletedAt filter — service may reference an
          // older version that was soft-deleted after a form update.
          const formCol = serviceModel.db.collection('formtemplates');
          const doc = await formCol.findOne({
            _id: new Types.ObjectId(formId.toString()),
          });
          if (!doc) return null;

          // Try to resolve the latest non-deleted version via formKey
          let resolved = doc;
          if (doc.formKey) {
            const latest = await formCol.findOne(
              { formKey: doc.formKey, deletedAt: null },
              { sort: { __v: -1 } },
            );
            if (latest) resolved = latest;
          }

          return {
            _id: resolved._id,
            title: resolved.title,
            description: resolved.description,
            formType: resolved.formType,
            fields: resolved.fields ?? [],
          };
        } catch {
          return null;
        }
      };

      const resolvePosition = async (positionId: any) => {
        if (!positionId) return null;
        try {
          const pos = await serviceModel.db.collection('positions').findOne({
            _id: new Types.ObjectId(positionId.toString()),
          });
          if (!pos) return null;
          return {
            _id: pos._id,
            name: pos.name,
            description: pos.description,
            companyId: pos.companyId,
            isActive: pos.isActive ?? true,
            deletedAt: pos.deletedAt ?? null,
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
        serviceRequestApprovalAccessType:
          src.serviceRequestApprovalAccessType ?? 'auto',
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

      const {
        serviceRequestConfig: _src,
        workOrdersConfig: _woc,
        ...rest
      } = service;

      return {
        ...rest,
        serviceRequestConfig: hydratedServiceRequestConfig,
        workOrdersConfig: hydratedWorkOrdersConfig,
      };
    }),
  );
}
