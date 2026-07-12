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

  // ---- Batched hydration ---------------------------------------------------
  // Collect every form/position referenced across ALL services up front, then
  // resolve them in a fixed number of queries. Previously each service issued
  // its own lookups (2 per form, 1 per position), so a list of N services with
  // M configs cost O(N*M) round-trips; this is now 3 regardless of size.
  const formIds = new Set<string>();
  const positionIds = new Set<string>();

  for (const service of services) {
    const src = service.serviceRequestConfig || {};
    if (src.intakeFormId) formIds.add(src.intakeFormId.toString());
    if (src.reviewFormId) formIds.add(src.reviewFormId.toString());

    for (const cfg of (service.workOrdersConfig || []) as any[]) {
      if (cfg.workOrderFormId) formIds.add(cfg.workOrderFormId.toString());
      if (cfg.workReportFormId) formIds.add(cfg.workReportFormId.toString());
      if (cfg.positionId) positionIds.add(cfg.positionId.toString());
    }
  }

  const formCol = serviceModel.db.collection('formtemplates');
  const positionCol = serviceModel.db.collection('positions');

  // Malformed ids are skipped, matching the old per-item try/catch -> null.
  const toObjectIds = (ids: Set<string>): Types.ObjectId[] => {
    const out: Types.ObjectId[] = [];
    for (const id of ids) {
      try {
        out.push(new Types.ObjectId(id));
      } catch {
        /* ignore */
      }
    }
    return out;
  };

  const [referencedForms, positionDocs] = await Promise.all([
    formIds.size
      ? formCol.find({ _id: { $in: toObjectIds(formIds) } }).toArray()
      : Promise.resolve([] as any[]),
    positionIds.size
      ? positionCol.find({ _id: { $in: toObjectIds(positionIds) } }).toArray()
      : Promise.resolve([] as any[]),
  ]);

  const formById = new Map<string, any>(
    referencedForms.map((f: any) => [f._id.toString(), f]),
  );
  const positionById = new Map<string, any>(
    positionDocs.map((p: any) => [p._id.toString(), p]),
  );

  // A service may reference an older form version (soft-deleted after an edit);
  // the response shows the latest non-deleted version of that formKey.
  const formKeys = [
    ...new Set(referencedForms.map((f: any) => f.formKey).filter(Boolean)),
  ];
  const latestByKey = new Map<string, any>();
  if (formKeys.length) {
    const latestDocs = await formCol
      .find({ formKey: { $in: formKeys }, deletedAt: null })
      .sort({ __v: -1 })
      .toArray();
    for (const doc of latestDocs) {
      // Sorted by __v desc, so the first hit for a key is the latest version.
      if (!latestByKey.has(doc.formKey)) latestByKey.set(doc.formKey, doc);
    }
  }

  const resolveForm = (formId: any) => {
    if (!formId) return null;
    const doc = formById.get(formId.toString());
    if (!doc) return null;

    const resolved = (doc.formKey && latestByKey.get(doc.formKey)) || doc;
    return {
      _id: resolved._id,
      title: resolved.title,
      description: resolved.description,
      formType: resolved.formType,
      fields: resolved.fields ?? [],
    };
  };

  const resolvePosition = (positionId: any) => {
    if (!positionId) return null;
    const pos = positionById.get(positionId.toString());
    if (!pos) return null;
    return {
      _id: pos._id,
      name: pos.name,
      description: pos.description,
      companyId: pos.companyId,
      isActive: pos.isActive ?? true,
      deletedAt: pos.deletedAt ?? null,
    };
  };

  return services.map((service) => {
    // Hydrate serviceRequestConfig
    const src = service.serviceRequestConfig || {};
    const hydratedServiceRequestConfig = {
      intakeForm: resolveForm(src.intakeFormId),
      reviewForm: resolveForm(src.reviewFormId),
      serviceRequestApprovalAccessType:
        src.serviceRequestApprovalAccessType ?? 'auto',
      reviewNeed: src.reviewNeed ?? false,
    };

    // Hydrate workOrdersConfig[]
    const rawConfigs: any[] = service.workOrdersConfig || [];
    const hydratedWorkOrdersConfig = rawConfigs.map((cfg) => ({
      _id: cfg._id,
      configId: cfg.configId,
      workOrderForm: resolveForm(cfg.workOrderFormId),
      workReportForm: resolveForm(cfg.workReportFormId),
      positionsOnDuty: resolvePosition(cfg.positionId),
      workOrderApprovalAccessType: cfg.workOrderApprovalAccessType,
      workReportApprovalAccessType: cfg.workReportApprovalAccessType,
      minStaff: cfg.minStaff,
      maxStaff: cfg.maxStaff,
      showReportToRequester: cfg.showReportToRequester ?? false,
    }));

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
  });
}
