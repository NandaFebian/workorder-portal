import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { LogoutDto } from './dto/logout.dto';

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

    @Post('register-owner')
    @HttpCode(HttpStatus.OK)
    async registerOwner(@Body() registerOwnerDto: RegisterOwnerDto) {
        const data = await this.authService.registerOwner(registerOwnerDto);
        return {
            success: true,
            message: 'Owner and company registered successfully',
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
    @HttpCode(HttpStatus.OK)
    async logout(@Body() logoutDto: LogoutDto) {
        const data = await this.authService.logout(logoutDto);
        return {
            success: true,
            message: 'Logout successful',
            data: data,
        };
    }
}