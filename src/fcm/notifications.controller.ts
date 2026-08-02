import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FcmService } from './fcm.service';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly fcmService: FcmService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification inbox' })
  async getInbox(@GetUser() user: AuthenticatedUser) {
    return this.fcmService.getInbox(user._id.toString());
  }

  @Post('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a device FCM token' })
  async registerToken(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    await this.fcmService.registerToken(user._id.toString(), dto.token);
    return { message: 'Token registered successfully' };
  }

  @Delete('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unregister a device FCM token' })
  async unregisterToken(@Body() dto: RegisterFcmTokenDto) {
    await this.fcmService.removeToken(dto.token);
    return { message: 'Token removed successfully' };
  }
}
