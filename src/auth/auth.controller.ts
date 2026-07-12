// src/auth/auth.controller.ts
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
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResponseUtil } from 'src/common/utils/response.util';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    const data = await this.authService.register(registerAuthDto);
    return ResponseUtil.success(
      'Verification code sent to your email. Please verify to complete registration.',
      data,
    );
  }

  @Post('register-company')
  @HttpCode(HttpStatus.OK)
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
    const data = await this.authService.registerCompany(registerCompanyDto);
    return ResponseUtil.success(
      'Verification code sent to your email. Please verify to complete registration.',
      data,
    );
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const data = await this.authService.verifyOtp(verifyOtpDto);
    return ResponseUtil.success(
      'Email verified and account created successfully',
      data,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const data = await this.authService.login(loginAuthDto);
    return ResponseUtil.success('Operation successful', data);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: any) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not found in header');
    }
    const token = authHeader.substring(7);

    const data = await this.authService.logout(token);

    return ResponseUtil.success(data.message, {
      timestamp: data.timestamp,
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() request: any) {
    const profile = request.user;
    delete profile.password;

    return ResponseUtil.success('Profile retrieved successfully', profile);
  }
}
