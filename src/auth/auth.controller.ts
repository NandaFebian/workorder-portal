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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new client or unassigned-staff user' })
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    const newUser = await this.authService.register(registerAuthDto);
    return ResponseUtil.success('User registered successfully', newUser);
  }

  @Post('register-company')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new company together with its owner' })
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
    const data = await this.authService.registerCompany(registerCompanyDto);
    return ResponseUtil.success(
      'Company and owner registered successfully',
      data,
      { welcome: true },
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email & password, returns a JWT token' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const data = await this.authService.login(loginAuthDto);
    return ResponseUtil.success('Operation successful', data);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out and invalidate the current token' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  getProfile(@Req() request: any) {
    const profile = request.user;
    delete profile.password;

    return ResponseUtil.success('Profile retrieved successfully', profile);
  }
}
