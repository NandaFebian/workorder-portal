import { Types } from 'mongoose';
import { getServicesWithAggregation } from './service-aggregation.helper';

/**
 * Locks in the response shape produced by the batched hydration, so the
 * optimisation cannot silently change what the API returns.
 */
describe('getServicesWithAggregation', () => {
  const oid = (hex: string) => new Types.ObjectId(hex.padStart(24, '0'));

  const INTAKE_V0 = oid('1');
  const INTAKE_V1 = oid('2');
  const WO_FORM = oid('3');
  const POSITION = oid('4');
  const SERVICE = oid('5');

  // formtemplates: the service points at v0, but v1 is the latest live version
  const formTemplates = [
    {
      _id: INTAKE_V0,
      formKey: 'intake-key',
      __v: 0,
      title: 'Intake v0',
      description: 'old',
      formType: 'intake',
      fields: [{ order: 1, label: 'old' }],
      deletedAt: new Date(),
    },
    {
      _id: INTAKE_V1,
      formKey: 'intake-key',
      __v: 1,
      title: 'Intake v1',
      description: 'new',
      formType: 'intake',
      fields: [{ order: 1, label: 'new' }],
      deletedAt: null,
    },
    {
      _id: WO_FORM,
      formKey: 'wo-key',
      __v: 0,
      title: 'WO Form',
      description: 'wo',
      formType: 'work_order',
      deletedAt: null,
      // no `fields` -> must default to []
    },
  ];

  const positions = [
    {
      _id: POSITION,
      name: 'Technician',
      description: 'field tech',
      companyId: oid('9'),
    },
  ];

  const service = {
    _id: SERVICE,
    serviceKey: 'svc-1',
    title: 'Servis Motor',
    serviceRequestConfig: {
      intakeFormId: INTAKE_V0, // deliberately an old version
      reviewFormId: null,
      reviewNeed: true,
    },
    workOrdersConfig: [
      {
        _id: oid('6'),
        configId: 'cfg-1',
        workOrderFormId: WO_FORM,
        workReportFormId: null,
        positionId: POSITION,
        minStaff: 1,
        maxStaff: 3,
      },
    ],
  };

  // Minimal in-memory Mongo driver stand-in.
  const makeCollection = (docs: any[]) => ({
    find: (query: any) => {
      let rows = docs.filter((d) => {
        if (query._id?.$in) {
          return query._id.$in.some((id: any) => id.equals(d._id));
        }
        if (query.formKey?.$in) {
          const keyMatch = query.formKey.$in.includes(d.formKey);
          const liveMatch =
            query.deletedAt === null ? d.deletedAt === null : true;
          return keyMatch && liveMatch;
        }
        return true;
      });
      const cursor: any = {
        sort: (spec: any) => {
          const [[field, dir]] = Object.entries(spec) as [[string, number]];
          rows = [...rows].sort(
            (a, b) => ((a[field] ?? 0) - (b[field] ?? 0)) * (dir as number),
          );
          return cursor;
        },
        toArray: async () => rows,
      };
      return cursor;
    },
  });

  const serviceModel: any = {
    aggregate: jest.fn().mockResolvedValue([service]),
    db: {
      collection: (name: string) =>
        name === 'formtemplates'
          ? makeCollection(formTemplates)
          : makeCollection(positions),
    },
  };

  it('returns raw services untouched when includeForms is false', async () => {
    const result = await getServicesWithAggregation(
      serviceModel,
      null,
      {},
      false,
    );
    expect(result).toEqual([service]);
  });

  it('hydrates forms/positions and upgrades a stale form ref to the latest version', async () => {
    const [result] = await getServicesWithAggregation(
      serviceModel,
      null,
      {},
      true,
    );

    // The service referenced the v0 intake form, but the response must expose
    // the latest non-deleted version of that formKey.
    expect(result.serviceRequestConfig.intakeForm).toEqual({
      _id: INTAKE_V1,
      title: 'Intake v1',
      description: 'new',
      formType: 'intake',
      fields: [{ order: 1, label: 'new' }],
    });

    // Null form ids stay null.
    expect(result.serviceRequestConfig.reviewForm).toBeNull();
    expect(result.serviceRequestConfig.reviewNeed).toBe(true);
    // Default applied when absent.
    expect(
      result.serviceRequestConfig.serviceRequestApprovalAccessType,
    ).toBe('auto');

    const [cfg] = result.workOrdersConfig;
    expect(cfg.workOrderForm).toEqual({
      _id: WO_FORM,
      title: 'WO Form',
      description: 'wo',
      formType: 'work_order',
      fields: [], // missing `fields` defaults to []
    });
    expect(cfg.workReportForm).toBeNull();
    expect(cfg.positionsOnDuty).toEqual({
      _id: POSITION,
      name: 'Technician',
      description: 'field tech',
      companyId: positions[0].companyId,
      isActive: true, // defaulted
      deletedAt: null, // defaulted
    });
    expect(cfg.minStaff).toBe(1);
    expect(cfg.maxStaff).toBe(3);
    expect(cfg.showReportToRequester).toBe(false); // defaulted

    // The raw config keys are replaced, not duplicated.
    expect(result.title).toBe('Servis Motor');
    expect(result.serviceKey).toBe('svc-1');
  });
});
