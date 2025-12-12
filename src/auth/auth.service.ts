// src/auth/auth.service.ts
import {
    Injectable,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CompaniesInternalService } from '../company/companies.internal.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private companiesService: CompaniesInternalService,
        private jwtService: JwtService,
    ) { }

    async register(registerAuthDto: RegisterAuthDto) {
        const existingUser = await this.usersService.findOneByEmail(
            registerAuthDto.email,
        );
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
        const newUser = await this.usersService.create(registerAuthDto);
        const { password, ...result } = newUser.toObject();
        return result;
    }

    async registerCompany(registerCompanyDto: RegisterCompanyDto) {
        const {
            name,
            email,
            password,
            companyName,
        } = registerCompanyDto;

        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new HttpException(
                {
                    message: 'Email already registered',
                    code: 'EMAIL_ALREADY_EXISTS',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const newOwner = await this.usersService.create({
            name,
            email,
            password,
            role: Role.CompanyOwner,
        });

        const newCompany = await this.companiesService.create({
            name: companyName,
            address: null,
            ownerId: newOwner._id as import('mongoose').Types.ObjectId,
        });

        await this.usersService.updateCompanyId(
            newOwner._id as import('mongoose').Types.ObjectId,
            newCompany._id as import('mongoose').Types.ObjectId
        );

        // Generate JWT token
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
                }
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

        if (user.role === Role.CompanyStaff) {
            userResponse.positionId = user.positionId;
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
