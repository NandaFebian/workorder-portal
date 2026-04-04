import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('public/service-request')
@UseGuards(AuthGuard) // Accessible by all Requesters (Clients + Staffs)
export class ServiceRequestPublicController {
  constructor(private readonly csrService: ServiceRequestService) {}

  @Get('sent')
  @HttpCode(HttpStatus.OK)
  async getSent(@GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findAllByClientId(user._id.toString());
    return ResponseUtil.success('Load sent service requests success', data);
  }

  @Get('services/:serviceId/intake-form')
  @HttpCode(HttpStatus.OK)
  async getIntakeFormPublic(
    @Param('serviceId') serviceId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    // TODO: Implement get public intake form logic
    return ResponseUtil.success('Load intake form success', {});
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findOneForClient(
      id,
      user._id.toString(),
    );
    return ResponseUtil.success('Load detail success', data);
  }

  @Post('service/:serviceId')
  @HttpCode(HttpStatus.CREATED)
  async submitIntake(
    @Param('serviceId') serviceId: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser
  ) {
    // TODO: Implement submit intake logic
    return ResponseUtil.success('Submit intake success', {});
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.CREATED)
  async submitReview(
    @Param('id') id: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser
  ) {
    // TODO: Implement submit review logic
    return ResponseUtil.success('Submit review success', {});
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSr(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // TODO: Implement cancel sr logic
    return ResponseUtil.success('Cancel SR success', {});
  }
}
