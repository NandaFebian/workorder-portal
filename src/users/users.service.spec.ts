import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Role } from 'src/common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  // Chainable query builder mock: find().select().sort().limit().lean().exec()
  const buildQuery = (result: any) => {
    const query: any = {};
    query.select = jest.fn().mockReturnValue(query);
    query.sort = jest.fn().mockReturnValue(query);
    query.limit = jest.fn().mockReturnValue(query);
    query.lean = jest.fn().mockReturnValue(query);
    query.exec = jest.fn().mockResolvedValue(result);
    return query;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchAvailableUnassignedStaffByEmail', () => {
    it('only matches unassigned staff without a company', async () => {
      const matches = [
        { _id: '1', name: 'Jane', email: 'jane@example.com', role: Role.UnassignedStaff },
      ];
      userModel.find.mockReturnValue(buildQuery(matches));

      const result = await service.searchAvailableUnassignedStaffByEmail('jane');

      expect(result).toEqual(matches);

      const filter = userModel.find.mock.calls[0][0];
      expect(filter.role).toBe(Role.UnassignedStaff);
      expect(filter.companyId).toBeNull();
      expect(filter.deletedAt).toBeNull();
      expect(filter.email.$regex).toBeInstanceOf(RegExp);
      expect(filter.email.$regex.test('JANE@example.com')).toBe(true); // case-insensitive
    });

    it('escapes regex special characters in the keyword', async () => {
      userModel.find.mockReturnValue(buildQuery([]));

      await service.searchAvailableUnassignedStaffByEmail('a.b+c@x');

      const regex: RegExp = userModel.find.mock.calls[0][0].email.$regex;
      expect(regex.test('xa.b+c@xy')).toBe(true);
      expect(regex.test('aXbXXcAx')).toBe(false);
    });

    it('applies a result limit', async () => {
      const query = buildQuery([]);
      userModel.find.mockReturnValue(query);

      await service.searchAvailableUnassignedStaffByEmail('foo', 5);

      expect(query.limit).toHaveBeenCalledWith(5);
    });
  });
});
