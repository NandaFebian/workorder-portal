import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('service-request')
  @ApiOperation({ summary: 'Service request statistics dashboard' })
  @ApiQuery({ name: 'period_type', required: false })
  async getServiceRequestDashboard(
    @Req() req: any,
    @Query('period_type') periodType?: string,
  ) {
    return this.dashboardService.getServiceRequestDashboard(
      req.user,
      periodType,
    );
  }

  @Get('work-order')
  @ApiOperation({ summary: 'Work order statistics dashboard' })
  @ApiQuery({ name: 'period_type', required: false })
  async getWorkOrderDashboard(
    @Req() req: any,
    @Query('period_type') periodType?: string,
  ) {
    return this.dashboardService.getWorkOrderDashboard(req.user, periodType);
  }

  @Get('company')
  @ApiOperation({ summary: 'Company overview dashboard' })
  async getCompanyDashboard(@Req() req: any) {
    return this.dashboardService.getCompanyDashboard(req.user);
  }
}
