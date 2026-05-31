import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Delete,
  Body,
} from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';
import { ServiceRequestStatus } from 'src/common/enums/service-request-status.enum';
import { AssignStaffDto } from 'src/work-order/dto/assign-staff.dto';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ServiceRequestInternalController {
  constructor(private readonly csrService: ServiceRequestService) {}

  // ─── Retrieve ────────────────────────────────────────────────────────────────

  @Get('service-requests/inbox')
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  async getInbox(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id)
      throw new ForbiddenException('No company associated');

    const data = await this.csrService.findAllByCompanyId(
      user.company._id.toString(),
      user,
    );
    return ResponseUtil.success('Load inbox success', data);
  }

  // ─── Status Transitions ───────────────────────────────────────────────────────

  @Patch('service-requests/:id/approve')
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(
      id,
      ServiceRequestStatus.APPROVED,
      user,
    );
    return ResponseUtil.success('Request approved successfully', data);
  }

  @Patch('service-requests/:id/reject')
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(
      id,
      ServiceRequestStatus.REJECTED,
      user,
    );
    return ResponseUtil.success('Request rejected successfully', data);
  }

  @Patch('service-requests/:id/assign-staff')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async assignStaff(
    @Param('id') id: string,
    @Body() assignStaffDto: AssignStaffDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.csrService.assignStaff(id, assignStaffDto, user);
    return ResponseUtil.success('Staff assigned successfully', data);
  }

  @Delete('service-requests/:id')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.remove(id, user);
    return ResponseUtil.success('Service request deleted successfully', data);
  }
}
