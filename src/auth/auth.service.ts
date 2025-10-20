// src/auth/auth.service.ts
import {
    Injectable,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActiveToken, ActiveTokenDocument } from './schemas/active-token.schema';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../company/companies.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private companiesService: CompaniesService,
        @InjectModel(ActiveToken.name) private activeTokenModel: Model<ActiveTokenDocument>,
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

        const tokenString = uuidv4();
        const newToken = new this.activeTokenModel({
            token: tokenString,
            userId: newOwner._id,
        });
        await newToken.save();

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
            token: `Bearer ${tokenString}`,
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

        const tokenString = uuidv4();

        const newToken = new this.activeTokenModel({
            token: tokenString,
            userId: user._id,
        });
        await newToken.save();

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
            token: `Bearer ${tokenString}`,
        };
    }

    async logout(token: string) {
        const deletedToken = await this.activeTokenModel.findOneAndDelete({ token: token }).exec();

        if (!deletedToken) {
            throw new HttpException({
                success: false,
                message: 'Invalid or expired token',
                errors: { token: 'The provided token is not valid or has already been invalidated' },
                code: 'AUTH_TOKEN_INVALID'
            }, HttpStatus.UNAUTHORIZED);
        }

        return {
            message: 'Logout successful',
            userId: deletedToken.userId,
            timestamp: new Date(),
        };
    }
}