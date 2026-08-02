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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';
import { ServiceRequestStatus } from 'src/common/enums/service-request-status.enum';

@ApiTags('Service Requests (Client)')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(AuthGuard)
export class ServiceRequestPublicController {
  constructor(private readonly csrService: ServiceRequestService) {}

  // ─── Retrieve ────────────────────────────────────────────────────────────────

  @Get('service-requests/sent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List service requests sent by the client' })
  async getSent(@GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findAllByClientId(user._id.toString());
    return ResponseUtil.success('Load sent service requests success', data);
  }

  @Get('service-requests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get service request detail (client view)' })
  async getDetailSr(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
    @Query('notificationId') notificationId?: string,
  ) {
    const data = await this.csrService.getUnifiedDetail(
      id,
      user,
      notificationId,
    );
    return ResponseUtil.success('Load detail success', data);
  }

  // ─── Submissions ─────────────────────────────────────────────────────────────

  @Post('service-requests/service/:serviceId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an intake form to create a service request' })
  async submitIntake(
    @Param('serviceId') serviceId: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.csrService.submitIntake(serviceId, user, body);
    return ResponseUtil.success('Submit intake success', data);
  }

  @Post('service-requests/:id/review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a review form for a service request' })
  async submitReview(
    @Param('id') id: string,
    @Body() body: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.csrService.submitReview(id, user, body);
    return ResponseUtil.success('Submit review success', data);
  }

  // ─── Status Transitions ───────────────────────────────────────────────────────

  @Patch('service-requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a service request' })
  async cancelSr(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(
      id,
      ServiceRequestStatus.CANCELLED,
      user,
    );
    return ResponseUtil.success('Cancel SR success', data);
  }

  // ─── Report for Requester ─────────────────────────────────────────────────────

  @Get('service-requests/:id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the report for a service request (requester)' })
  async getReport(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.getReportForRequester(id, user);
    return ResponseUtil.success('Report retrieved successfully', data);
  }
}
