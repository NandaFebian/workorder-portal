import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('service-request')
  async getServiceRequestDashboard(
    @Req() req: any,
    @Query('period_type') periodType?: string,
  ) {
    return this.dashboardService.getServiceRequestDashboard(req.user, periodType);
  }

  @Get('work-order')
  async getWorkOrderDashboard(
    @Req() req: any,
    @Query('period_type') periodType?: string,
  ) {
    return this.dashboardService.getWorkOrderDashboard(req.user, periodType);
  }

  @Get('company')
  async getCompanyDashboard(@Req() req: any) {
    return this.dashboardService.getCompanyDashboard(req.user);
  }
}
