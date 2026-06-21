import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CompaniesInternalService } from 'src/company/companies.internal.service';
import { PositionsService } from 'src/positions/positions.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let companiesService: CompaniesInternalService;
  let positionsService: PositionsService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            updateCompanyId: jest.fn(),
          },
        },
        {
          provide: CompaniesInternalService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: PositionsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    companiesService = module.get<CompaniesInternalService>(CompaniesInternalService);
    positionsService = module.get<PositionsService>(PositionsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── login() ───

  describe('login()', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@test.com',
      password: '$2b$10$hashedPasswordExample',
      role: Role.CompanyOwner,
      companyId: '507f1f77bcf86cd799439012',
      positionId: null,
    };
    const loginDto = { email: 'test@test.com', password: 'pass123' };

    it('UT-AUTH-001: Login dengan kredensial valid → mengembalikan profil dan token', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockJwtToken123');

      const result = await authService.login(loginDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toContain('Bearer');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('UT-AUTH-002: Login dengan password salah → throw UnauthorizedError', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
      await expect(authService.login(loginDto)).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'AUTH_INVALID_CREDENTIALS',
        }),
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('UT-AUTH-003: Login dengan email tidak terdaftar → throw UnauthorizedError', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
      await expect(authService.login(loginDto)).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'AUTH_INVALID_CREDENTIALS',
        }),
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  // ─── register() ───

  describe('register()', () => {
    const registerDto = {
      name: 'New User',
      email: 'new@test.com',
      password: 'password123',
    };

    it('UT-AUTH-004: Registrasi user baru dengan payload valid → mengembalikan data user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      const createdUser = {
        _id: '507f1f77bcf86cd799439099',
        name: 'New User',
        email: 'new@test.com',
        password: '$2b$10$hashedPassword',
        fcmTokens: [],
        role: Role.Client,
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439099',
          name: 'New User',
          email: 'new@test.com',
          password: '$2b$10$hashedPassword',
          fcmTokens: [],
          role: Role.Client,
        }),
      };
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser as any);

      const result = await authService.register(registerDto as any);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith('new@test.com');
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toHaveProperty('email', 'new@test.com');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('fcmTokens');
    });

    it('UT-AUTH-005: Registrasi dengan email sudah terdaftar → throw ConflictError', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({ email: 'new@test.com' } as any);

      await expect(authService.register(registerDto as any)).rejects.toThrow(HttpException);
      await expect(authService.register(registerDto as any)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('UT-AUTH-006: Registrasi dengan payload tidak lengkap → delegasi ke UsersService (ValidationPipe)', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockRejectedValue(new Error('Validation failed'));

      await expect(authService.register({ email: '', name: '' } as any)).rejects.toThrow();
    });
  });

  // ─── registerCompany() ───

  describe('registerCompany()', () => {
    const registerCompanyDto = {
      name: 'Owner',
      email: 'owner@test.com',
      password: 'password123',
      companyName: 'Test Corp',
    };

    it('UT-AUTH-007: Registrasi company baru → mengembalikan User dan Company terelasi', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      const mockOwner = {
        _id: '507f1f77bcf86cd799439050',
        name: 'Owner',
        email: 'owner@test.com',
        role: Role.CompanyOwner,
      };
      const mockCompany = {
        _id: '507f1f77bcf86cd799439060',
        name: 'Test Corp',
      };
      jest.spyOn(usersService, 'create').mockResolvedValue(mockOwner as any);
      jest.spyOn(companiesService, 'create').mockResolvedValue(mockCompany as any);
      jest.spyOn(usersService, 'updateCompanyId').mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockCompanyToken');

      const result = await authService.registerCompany(registerCompanyDto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'owner@test.com', role: Role.CompanyOwner }),
      );
      expect(companiesService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Corp' }),
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('owner@test.com');
      expect(result.user.company.name).toBe('Test Corp');
    });

    it('UT-AUTH-008: Registrasi company dengan email owner sudah terdaftar → throw ConflictError', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({ email: 'owner@test.com' } as any);

      await expect(authService.registerCompany(registerCompanyDto)).rejects.toThrow(HttpException);
      expect(usersService.create).not.toHaveBeenCalled();
      expect(companiesService.create).not.toHaveBeenCalled();
    });

    it('UT-AUTH-009: Registrasi company dengan nama perusahaan kosong → delegasi validasi', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue({ _id: 'x', email: 'o@t.com', role: Role.CompanyOwner } as any);
      jest.spyOn(companiesService, 'create').mockRejectedValue(new Error('Validation failed'));

      await expect(
        authService.registerCompany({ ...registerCompanyDto, companyName: '' }),
      ).rejects.toThrow();
    });
  });
});
