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

@Controller()
@UseGuards(AuthGuard) // Accessible by all Requesters (Clients + Staffs)
export class ServiceRequestPublicController {
  constructor(private readonly csrService: ServiceRequestService) {}

  @Get('service-requests/sent')
  @HttpCode(HttpStatus.OK)
  async getSent(@GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findAllByClientId(user._id.toString());
    return ResponseUtil.success('Load sent service requests success', data);
  }

  @Get('service-requests/:id')
  @HttpCode(HttpStatus.OK)
  async getDetailSr(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.csrService.getUnifiedDetail(id, user);
    return ResponseUtil.success('Load detail success', data);
  }

  @Post('service-request/service/:serviceId')
  @HttpCode(HttpStatus.CREATED)
  async submitIntake(
    @Param('serviceId') serviceId: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser
  ) {
    const data = await this.csrService.submitIntake(serviceId, user, body);
    return ResponseUtil.success('Submit intake success', data);
  }

  @Post('service-request/:id/review')
  @HttpCode(HttpStatus.CREATED)
  async submitReview(
    @Param('id') id: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser
  ) {
    const data = await this.csrService.submitReview(id, user, body);
    return ResponseUtil.success('Submit review success', data);
  }

  @Patch('service-requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSr(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(id, 'cancelled', user);
    return ResponseUtil.success('Cancel SR success', data);
  }
}
