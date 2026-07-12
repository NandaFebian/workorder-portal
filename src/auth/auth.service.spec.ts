// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesInternalService } from '../company/companies.internal.service';
import { PositionsService } from '../positions/positions.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { PendingRegistration } from './schemas/pending-registration.schema';
import { MailService } from '../mail/mail.service';
import { hashOtp } from '../common/utils/otp.util';
import { encrypt } from '../common/utils/crypto.util';

// Auto-mock bcrypt so `jest.spyOn(bcrypt, 'compare')` in the login tests can
// redefine it (the real module export is non-configurable).
jest.mock('bcrypt');

const asExec = (value: any) => ({ exec: jest.fn().mockResolvedValue(value) });

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let pendingModel: any;
  let mailService: MailService;

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
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: getModelToken(PendingRegistration.name),
          useValue: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendOtpEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    pendingModel = module.get(getModelToken(PendingRegistration.name));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true as never));
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
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true as never));
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
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true as never));
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

  describe('register() — OTP dispatch', () => {
    const dto = {
      name: 'New User',
      email: 'New@Example.com',
      password: 'password123',
      role: Role.Client,
    };

    it('stores a pending registration and emails an OTP without creating a user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      pendingModel.findOneAndUpdate.mockReturnValue(asExec({}));

      const result = await authService.register(dto as any);

      expect(usersService.create).not.toHaveBeenCalled();
      expect(pendingModel.findOneAndUpdate).toHaveBeenCalledTimes(1);

      const [filter, update, options] =
        pendingModel.findOneAndUpdate.mock.calls[0];
      expect(filter.email).toBe('new@example.com'); // normalized
      expect(update.type).toBe('user');
      expect(update.role).toBe(Role.Client);
      expect(update.password).not.toBe(dto.password); // encrypted at rest
      expect(update.otpHash).toEqual(expect.any(String));
      expect(options.upsert).toBe(true);

      expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.any(String),
        dto.name,
      );
      expect(result).toEqual({
        email: 'new@example.com',
        expiresInSeconds: 300,
      });
    });

    it('rejects when the email is already registered', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue({ _id: 'x' } as any);

      await expect(authService.register(dto as any)).rejects.toThrow(
        HttpException,
      );
      expect(pendingModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(mailService.sendOtpEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp()', () => {
    const email = 'new@example.com';
    const otp = '123456';

    const makePending = (overrides: any = {}) => ({
      _id: 'pending-1',
      email,
      name: 'New User',
      password: encrypt('password123'),
      type: 'user',
      role: Role.Client,
      companyName: null,
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('creates the user account on a valid OTP and clears the pending record', async () => {
      const pending = makePending();
      pendingModel.findOne.mockReturnValue(asExec(pending));
      pendingModel.deleteOne.mockReturnValue(asExec({}));
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        toObject: () => ({
          _id: 'u1',
          name: 'New User',
          email,
          role: Role.Client,
          password: 'hashed',
          fcmTokens: [],
        }),
      } as any);

      const result = await authService.verifyOtp({ email, otp });

      // Password decrypted back to the original before hashing by the model.
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email, password: 'password123', role: Role.Client }),
      );
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('fcmTokens');
      expect(pendingModel.deleteOne).toHaveBeenCalledWith({ _id: 'pending-1' });
    });

    it('increments attempts and throws on an invalid OTP', async () => {
      const pending = makePending();
      pendingModel.findOne.mockReturnValue(asExec(pending));

      await expect(
        authService.verifyOtp({ email, otp: '000000' }),
      ).rejects.toThrow(BadRequestException);

      expect(pending.attempts).toBe(1);
      expect(pending.save).toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('throws and deletes the pending record when the OTP has expired', async () => {
      const pending = makePending({
        otpExpiresAt: new Date(Date.now() - 1000),
      });
      pendingModel.findOne.mockReturnValue(asExec(pending));
      pendingModel.deleteOne.mockReturnValue(asExec({}));

      await expect(authService.verifyOtp({ email, otp })).rejects.toThrow(
        /expired/i,
      );
      expect(pendingModel.deleteOne).toHaveBeenCalledWith({ _id: 'pending-1' });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('throws when there is no pending registration', async () => {
      pendingModel.findOne.mockReturnValue(asExec(null));

      await expect(authService.verifyOtp({ email, otp })).rejects.toThrow(
        /No pending registration/i,
      );
    });
  });
});
