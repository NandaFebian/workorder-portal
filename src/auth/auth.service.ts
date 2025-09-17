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
import { CompaniesService } from '../companies/companies.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LogoutDto } from './dto/logout.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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
        // Panggilan ini sekarang valid karena RegisterAuthDto cocok dengan struktur CreateUserDto
        const newUser = await this.usersService.create(registerAuthDto);
        const { password, ...result } = newUser.toObject();
        return result;
    }

    async registerOwner(registerOwnerDto: RegisterOwnerDto) {
        const {
            name,
            email,
            password,
            confirmPassword,
            companyName,
            companyAddress,
        } = registerOwnerDto;

        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

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

        // Panggilan ini sekarang valid karena objek yang kita buat cocok dengan struktur CreateUserDto
        const newOwner = await this.usersService.create({
            name,
            email,
            password,
            role: 'owner_company',
        });

        const newCompany = await this.companiesService.create({
            name: companyName,
            address: companyAddress,
            ownerId: newOwner._id as import('mongoose').Types.ObjectId,
        });

        await this.usersService.updateCompanyId(
            newOwner._id as import('mongoose').Types.ObjectId,
            newCompany._id as import('mongoose').Types.ObjectId
        );

        return {
            id: newOwner._id,
            name: newOwner.name,
            email: newOwner.email,
            role: 'owner_company',
        };
    }

    async login(loginAuthDto: LoginAuthDto) {
        const { email, password } = loginAuthDto;
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Invalid credentials',
                    errors: { email: 'Email not found' },
                    code: 'AUTH_INVALID_CREDENTIALS',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Invalid credentials',
                    errors: { password: 'Password is incorrect' },
                    code: 'AUTH_INVALID_CREDENTIALS',
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

        if (user.role === 'staff_company') {
            userResponse.positionId = user.positionId;
        }

        return {
            user: userResponse,
            token: `Bearer ${tokenString}`,
        };
    }

    async logout(logoutDto: LogoutDto) {
        // Hapus 'Bearer ' dari string token jika ada
        const token = logoutDto.token.startsWith('Bearer ')
            ? logoutDto.token.substring(7)
            : logoutDto.token;

        // Cari dan hapus token dari database
        const deletedToken = await this.activeTokenModel.findOneAndDelete({ token: token }).exec();

        // Jika token tidak ditemukan, lempar error
        if (!deletedToken) {
            throw new HttpException({
                success: false,
                message: 'Invalid or expired token',
                errors: { token: 'The provided token is not valid or has expired' },
                code: 'AUTH_TOKEN_INVALID'
            }, HttpStatus.UNAUTHORIZED);
        }

        // Jika berhasil, kembalikan response sukses
        return {
            userId: deletedToken.userId,
            timestamp: new Date(),
        };
    }
}