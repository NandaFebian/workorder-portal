// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Returns the authenticated user's full profile.
   */
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user._id.toString());
  }

  /**
   * PATCH /users/me
   * Update the authenticated user's profile.
   * Supports: name, email, password change (requires currentPassword).
   */
  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user._id.toString(), dto);
  }
}

