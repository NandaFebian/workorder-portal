import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardSummary(@Req() req: any) {
    // req.user comes from AuthGuard (decoded JWT + fetched user)
    return this.dashboardService.getDashboardSummary(req.user);
  }
}
