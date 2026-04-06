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
} from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

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
    );
    return ResponseUtil.success('Load inbox success', data);
  }

  // ─── Status Transitions ───────────────────────────────────────────────────────

  @Patch('service-requests/:id/approve')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(id, 'approved', user);
    return ResponseUtil.success('Request approved successfully', data);
  }

  @Patch('service-requests/:id/reject')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.updateStatus(id, 'rejected', user);
    return ResponseUtil.success('Request rejected successfully', data);
  }

  @Delete('service-requests/:id')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.remove(id, user);
    return ResponseUtil.success(
      'Service request deleted successfully',
      data,
    );
  }
}
