// src/company/companies.client.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesClientService } from './companies.client.service';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from './schemas/company.schemas';
import { Service } from 'src/service/schemas/service.schema';
import { ServicesClientService } from 'src/service/services.client.service';

describe('CompaniesClientService', () => {
  let service: CompaniesClientService;
  let companyModel: any;
  let serviceModel: any;

  // Chainable query builder mock: find().select().sort().exec()
  const buildQuery = (result: any[]) => {
    const query: any = {};
    query.select = jest.fn().mockReturnValue(query);
    query.sort = jest.fn().mockReturnValue(query);
    query.exec = jest.fn().mockResolvedValue(result);
    return query;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesClientService,
        {
          provide: getModelToken(Company.name),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(Service.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
        {
          provide: ServicesClientService,
          useValue: {
            findAllByCompanyId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesClientService>(CompaniesClientService);
    companyModel = module.get(getModelToken(Company.name));
    serviceModel = module.get(getModelToken(Service.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllPublic', () => {
    it('returns all active companies without a keyword and does not query services', async () => {
      const companies = [{ _id: '1', name: 'Company A' }];
      companyModel.find.mockReturnValue(buildQuery(companies));

      const result = await service.findAllPublic();

      expect(result).toEqual(companies);
      expect(companyModel.find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: null,
      });
      expect(serviceModel.aggregate).not.toHaveBeenCalled();
    });

    it('treats a blank keyword as no keyword', async () => {
      companyModel.find.mockReturnValue(buildQuery([]));

      await service.findAllPublic('   ');

      expect(companyModel.find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: null,
      });
      expect(serviceModel.aggregate).not.toHaveBeenCalled();
    });

    it('matches companies by name OR by a public service title', async () => {
      // Company B owns a public service whose title matches the keyword.
      serviceModel.aggregate.mockResolvedValue([{ _id: 'companyB' }]);
      const matched = [{ _id: 'companyB', name: 'Company B' }];
      companyModel.find.mockReturnValue(buildQuery(matched));

      const result = await service.findAllPublic('Servis Motor');

      expect(result).toEqual(matched);

      // Aggregation restricts to the latest, active, public service versions.
      const pipeline = serviceModel.aggregate.mock.calls[0][0];
      const accessMatch = pipeline.find(
        (stage: any) => stage.$match && stage.$match.accessType,
      );
      expect(accessMatch.$match.accessType).toBe('public');
      expect(accessMatch.$match.isActive).toBe(true);

      const filter = companyModel.find.mock.calls[0][0];
      expect(filter.isActive).toBe(true);
      expect(filter.deletedAt).toBeNull();
      expect(filter.$or).toHaveLength(2);
      expect(filter.$or[1]._id.$in).toEqual(['companyB']);
    });

    it('escapes regex special characters in the keyword', async () => {
      serviceModel.aggregate.mockResolvedValue([]);
      companyModel.find.mockReturnValue(buildQuery([]));

      await service.findAllPublic('a.b*c');

      const filter = companyModel.find.mock.calls[0][0];
      const nameRegex: RegExp = filter.$or[0].name.$regex;
      // The literal string should match, but the regex metacharacters should not.
      expect(nameRegex.test('xa.b*cx')).toBe(true);
      expect(nameRegex.test('aXbXXc')).toBe(false);
    });
  });
});
