import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    Req,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.OK) // Sesuai permintaan, respons sukses adalah 200 OK
    async register(@Body() registerAuthDto: RegisterAuthDto) {
        const newUser = await this.authService.register(registerAuthDto);
        return {
            success: true,
            message: 'User registered successfully',
            data: newUser,
        };
    }

    @Post('register-company')
    @HttpCode(HttpStatus.OK)
    async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
        const data = await this.authService.registerCompany(registerCompanyDto);
        return {
            message: 'Company and owner registered successfully',
            meta: {
                welcome: true,
            },
            data: data,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Set default status code 200 untuk POST
    async login(@Body() loginAuthDto: LoginAuthDto) {
        const data = await this.authService.login(loginAuthDto);
        return {
            success: true,
            message: 'Operation successful',
            data: data,
        };
    }

    @Post('logout')
    @UseGuards(AuthGuard) // Gunakan AuthGuard untuk memastikan ada token yang valid
    @HttpCode(HttpStatus.OK)
    async logout(@Req() request: any) {
        // Ekstrak token dari header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token not found in header');
        }
        const token = authHeader.substring(7);

        const data = await this.authService.logout(token);

        return {
            success: true,
            message: data.message,
            data: {
                userId: data.userId,
                timestamp: data.timestamp,
            },
        };
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    getProfile(@Req() request: any) {
        const profile = request.user;

        delete profile.password;

        return {
            success: true,
            message: 'Profile retrieved successfully',
            data: profile,
        };
    }
}