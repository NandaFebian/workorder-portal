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

@Controller('service-request')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
export class ServiceRequestInternalController {
  constructor(private readonly csrService: ServiceRequestService) {}

  @Get('inbox')
  @HttpCode(HttpStatus.OK)
  async getInbox(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id)
      throw new ForbiddenException('No company associated');
    
    const data = await this.csrService.findAllByCompanyId(
      user.company._id.toString(),
    );
    return ResponseUtil.success('Load inbox success', data);
  }

  @Get('services/:serviceId/intake-form')
  @HttpCode(HttpStatus.OK)
  async getIntakeFormInternal(
    @Param('serviceId') serviceId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    if (!user.company?._id)
      throw new ForbiddenException('No company associated');
      
    // TODO: Implement get internal intake form logic
    return ResponseUtil.success('Load intake form success', {});
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    if (!user.company?._id)
      throw new ForbiddenException('No company associated');
    
    const data = await this.csrService.findOneInternal(id, user);
    return ResponseUtil.success('Load detail success', data);
  }

  @Post(':id/review')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.CREATED) // or OK
  async submitReview(@Param('id') id: string, @Body() body: any, @GetUser() user: AuthenticatedUser) {
    // TODO: Implement submit review logic
    return ResponseUtil.success('Submit review success', {});
  }

  @Patch(':id/approve')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // TODO: Implement approve SR logic
    return ResponseUtil.success('Request approved successfully', {});
  }

  @Patch(':id/reject')
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // TODO: Implement reject SR logic
    return ResponseUtil.success('Request rejected successfully', {});
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.remove(id, user);
    return ResponseUtil.success(
      'Service request deleted successfully',
      data,
    );
  }
}
