// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesInternalService } from '../company/companies.internal.service';
import { PositionsService } from '../positions/positions.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
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
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

    const loginDto = {
      email: 'test@test.com',
      password: 'pass123',
    };

    it('UT-AUTH-001: should return user and token when credentials are valid', async () => {
      // Arrange
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockJwtToken123');

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', mockUser.password);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('Bearer mockJwtToken123');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('UT-AUTH-002: should throw UnauthorizedException when user not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Invalid credentials',
            code: 'AUTH_INVALID_CREDENTIALS',
            errors: [
              {
                field: 'email',
                message: 'Email not registered',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('UT-AUTH-003: should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false as never));

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Invalid credentials',
            code: 'AUTH_INVALID_CREDENTIALS',
            errors: [
              {
                field: 'password',
                message: 'Password is incorrect',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', mockUser.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('UT-AUTH-004: should call bcrypt.compare with correct parameters', async () => {
      // Arrange
      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true as never));
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

      // Act
      await authService.login(loginDto);

      // Assert
      expect(compareSpy).toHaveBeenCalledWith('pass123', mockUser.password);
      expect(compareSpy).toHaveBeenCalledTimes(1);
    });

    it('UT-AUTH-005: should generate JWT payload with complete user data', async () => {
      // Arrange
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      const signSpy = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('mockToken');

      // Act
      await authService.login(loginDto);

      // Assert
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser._id.toString(),
          email: mockUser.email,
          role: mockUser.role,
          companyId: mockUser.companyId.toString(),
        }),
      );
    });

    it('UT-AUTH-006: should not include password in response', async () => {
      // Arrange
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
      };
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(userWithPassword as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('_id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });

    it('UT-AUTH-007: should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      jest.spyOn(usersService, 'findOneByEmail').mockRejectedValue(dbError);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
    });
  });
});
