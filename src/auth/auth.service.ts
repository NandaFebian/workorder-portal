// src/auth/auth.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CompaniesInternalService } from '../company/companies.internal.service';
import { PositionsService } from '../positions/positions.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import {
  PendingRegistration,
  PendingRegistrationDocument,
} from './schemas/pending-registration.schema';
import { MailService } from '../mail/mail.service';
import {
  generateOtp,
  hashOtp,
  OTP_TTL_MS,
} from '../common/utils/otp.util';
import { encrypt, decrypt } from '../common/utils/crypto.util';

const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesInternalService,
    private positionsService: PositionsService,
    private jwtService: JwtService,
    @InjectModel(PendingRegistration.name)
    private pendingModel: Model<PendingRegistrationDocument>,
    private mailService: MailService,
  ) {}

  /**
   * Step 1 (user signup): validate, store a pending registration, and email an
   * OTP. The account is only created after the OTP is verified.
   */
  async register(registerAuthDto: RegisterAuthDto) {
    await this.assertEmailAvailable(registerAuthDto.email);
    return this.createPendingAndSendOtp({
      type: 'user',
      name: registerAuthDto.name,
      email: registerAuthDto.email,
      password: registerAuthDto.password,
      role: registerAuthDto.role,
      companyName: null,
    });
  }

  /**
   * Step 1 (company/owner signup): same as register but carries the company
   * name so the company can be created on verification.
   */
  async registerCompany(registerCompanyDto: RegisterCompanyDto) {
    await this.assertEmailAvailable(registerCompanyDto.email);
    return this.createPendingAndSendOtp({
      type: 'company',
      name: registerCompanyDto.name,
      email: registerCompanyDto.email,
      password: registerCompanyDto.password,
      role: Role.CompanyOwner,
      companyName: registerCompanyDto.companyName,
    });
  }

  /**
   * Step 2: verify the OTP and, on success, create the real account. Returns
   * the same shape the original register endpoints returned:
   *   - type 'user'    -> the sanitized user object
   *   - type 'company' -> { user, token }
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const email = verifyOtpDto.email.toLowerCase().trim();
    const pending = await this.pendingModel.findOne({ email }).exec();

    if (!pending) {
      throw new BadRequestException(
        'No pending registration found for this email. Please register again.',
      );
    }

    if (pending.otpExpiresAt.getTime() < Date.now()) {
      await this.pendingModel.deleteOne({ _id: pending._id }).exec();
      throw new BadRequestException(
        'OTP has expired. Please register again to receive a new code.',
      );
    }

    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      await this.pendingModel.deleteOne({ _id: pending._id }).exec();
      throw new BadRequestException(
        'Too many invalid attempts. Please register again to receive a new code.',
      );
    }

    if (hashOtp(verifyOtpDto.otp) !== pending.otpHash) {
      pending.attempts += 1;
      await pending.save();
      throw new BadRequestException('Invalid OTP.');
    }

    // Guard against a race where the email got registered in the meantime.
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      await this.pendingModel.deleteOne({ _id: pending._id }).exec();
      throw new HttpException(
        { message: 'Email already registered', code: 'EMAIL_ALREADY_EXISTS' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const password = decrypt(pending.password);

    const result =
      pending.type === 'company'
        ? await this.createCompanyAccount({
            name: pending.name,
            email,
            password,
            companyName: pending.companyName as string,
          })
        : await this.createUserAccount({
            name: pending.name,
            email,
            password,
            role: pending.role as string,
          });

    await this.pendingModel.deleteOne({ _id: pending._id }).exec();
    return result;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new HttpException(
        {
          success: false,
          message: 'Email already registered',
          errors: { email: 'This email is already in use' },
          code: 'AUTH_EMAIL_EXISTS',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createPendingAndSendOtp(data: {
    type: 'user' | 'company';
    name: string;
    email: string;
    password: string;
    role: string;
    companyName: string | null;
  }): Promise<{ email: string; expiresInSeconds: number }> {
    const email = data.email.toLowerCase().trim();
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Upsert so a re-registration replaces any previous pending record + OTP.
    await this.pendingModel
      .findOneAndUpdate(
        { email },
        {
          email,
          name: data.name,
          password: encrypt(data.password),
          type: data.type,
          role: data.role,
          companyName: data.companyName,
          otpHash: hashOtp(otp),
          otpExpiresAt,
          attempts: 0,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    await this.mailService.sendOtpEmail(email, otp, data.name);

    return { email, expiresInSeconds: OTP_TTL_MS / 1000 };
  }

  private async createUserAccount(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const newUser = await this.usersService.create(data);
    const { password, fcmTokens, ...result } = newUser.toObject();
    return result;
  }

  private async createCompanyAccount(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) {
    const newOwner = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: Role.CompanyOwner,
    });

    const newCompany = await this.companiesService.create({
      name: data.companyName,
      address: null,
      ownerId: newOwner._id as import('mongoose').Types.ObjectId,
    });

    await this.usersService.updateCompanyId(
      newOwner._id as import('mongoose').Types.ObjectId,
      newCompany._id as import('mongoose').Types.ObjectId,
    );

    const payload: JwtPayload = {
      userId: (newOwner._id as any).toString(),
      email: newOwner.email,
      role: newOwner.role,
      companyId: (newCompany._id as any).toString(),
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        name: newOwner.name,
        email: newOwner.email,
        role: newOwner.role,
        company: {
          _id: newCompany._id,
          name: newCompany.name,
        },
      },
      token: `Bearer ${token}`,
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new HttpException(
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
      );
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new HttpException(
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
      );
    }

    // Build JWT payload
    const payload: JwtPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    // Add optional fields if they exist
    if (user.companyId) {
      payload.companyId = (user.companyId as any).toString();
    }
    if (user.positionId) {
      payload.positionId = (user.positionId as any).toString();
    }

    // Generate JWT token
    const token = this.jwtService.sign(payload);

    // Build user response
    const userResponse: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.positionId) {
      try {
        const position = await this.positionsService.findById(
          (user.positionId as any).toString(),
        );
        const p = position.toObject ? position.toObject() : position;
        userResponse.position = {
          _id: p._id,
          name: p.name,
          description: p.description,
          isActive: p.isActive,
          companyId: p.companyId,
        };
      } catch {
        userResponse.position = null;
      }
    }

    return {
      user: userResponse,
      token: `Bearer ${token}`,
    };
  }

  /**
   * Logout (Client-side)
   * With JWT, logout is handled client-side by discarding the token.
   * This endpoint is kept for API compatibility but doesn't need to do anything server-side.
   *
   * Optional: Implement token blacklist using Redis for additional security.
   */
  async logout(token: string) {
    // Client-side logout: Just return success
    // The client should discard the JWT token

    return {
      message: 'Logout successful. Please discard your token.',
      timestamp: new Date(),
    };
  }
}
