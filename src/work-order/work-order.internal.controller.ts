import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkOrderService } from './work-order.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { WorkOrderFilterDto } from './dto/work-order-filter.dto';
import { CreateSubmissionsDto } from './dto/create-submissions.dto';
import { SubmitWorkReportFormDto } from 'src/work-report/dto/submit-work-report-form.dto';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('Work Orders')
@ApiBearerAuth('access-token')
@Controller('workorders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
export class WorkOrderInternalController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a work order' })
  async create(
    @Body() createWorkOrderDto: CreateWorkOrderDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.create(createWorkOrderDto, user);
    return ResponseUtil.success(
      'Work Order created successfully',
      result.data,
      result.meta,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List work orders (with filters)' })
  async findAll(
    @GetUser() user: AuthenticatedUser,
    @Query() filterDto: WorkOrderFilterDto,
  ) {
    const data = await this.workOrderService.findAllInternal(user, filterDto);
    return ResponseUtil.success('Load data success', data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a work order by id' })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
    @Query('notificationId') notificationId?: string,
  ) {
    const result = await this.workOrderService.findOneInternal(
      id,
      user,
      notificationId,
    );
    return ResponseUtil.success('Load data success', result.data, result.meta);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a work order' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.update(
      id,
      updateWorkOrderDto,
      user,
    );
    return ResponseUtil.success(
      'Work Order updated successfully',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update work order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateWorkOrderStatusDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.updateStatus(
      id,
      updateStatusDto,
      user,
    );
    return ResponseUtil.success(
      'Work Order status updated successfully',
      result.data,
      result.meta,
    );
  }

  @Put(':id/assign-staffs')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Assign staff to a work order' })
  async assignStaff(
    @Param('id') id: string,
    @Body() assignStaffDto: AssignStaffDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.assignStaff(
      id,
      assignStaffDto,
      user,
    );
    return ResponseUtil.success(
      'Staff assigned successfully',
      result.data,
      result.meta,
    );
  }

  @Put(':id/submissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save work order form submissions' })
  async createSubmissions(
    @Param('id') id: string,
    @Body() createSubmissionsDto: CreateSubmissionsDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.createSubmissions(
      id,
      createSubmissionsDto,
      user,
    );
    return ResponseUtil.success(
      'Submissions saved successfully',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/sent')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @ApiOperation({ summary: 'Mark a work order as sent' })
  async markAsSent(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.markAsSent(id, user);
    return ResponseUtil.success(
      'Work Order marked as sent',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a work order' })
  async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.approve(id, user);
    return ResponseUtil.success(
      'Work Order approved',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a work order' })
  async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.reject(id, user);
    return ResponseUtil.success(
      'Work Order rejected',
      result.data,
      result.meta,
    );
  }

  @Post(':id/recreate')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @ApiOperation({ summary: 'Recreate a work order from an existing one' })
  async recreate(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.recreate(id, user);
    return ResponseUtil.success(
      'Work Order recreated',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @ApiOperation({ summary: 'Cancel a work order' })
  async cancel(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.cancel(id, user);
    return ResponseUtil.success(
      'Work Order cancelled',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a work order' })
  async start(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.start(id, user);
    return ResponseUtil.success('Work Order started', result.data, result.meta);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @ApiOperation({ summary: 'Complete a work order' })
  async complete(
    @Param('id') id: string,
    @Body('issue') issue: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.complete(
      id,
      issue || null,
      user,
    );
    return ResponseUtil.success(
      'Work Order completed',
      result.data,
      result.meta,
    );
  }

  @Patch(':id/fail')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @ApiOperation({ summary: 'Mark a work order as failed' })
  async fail(
    @Param('id') id: string,
    @Body('issue') issue: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.fail(id, issue, user);
    return ResponseUtil.success('Work Order failed', result.data, result.meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Delete a work order' })
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.remove(id, user);
    return ResponseUtil.success(
      'Work order deleted successfully',
      result.data,
      result.meta,
    );
  }

  @Get(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the report of a work order' })
  async getReport(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const result = await this.workOrderService.getReport(id, user);
    return ResponseUtil.success(
      'Report retrieved successfully',
      result.report,
      result.meta,
    );
  }

  @Put(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit the work report form for a work order' })
  async submitReportForm(
    @Param('id') id: string,
    @Body() submitDto: SubmitWorkReportFormDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.workOrderService.submitReportForm(
      id,
      submitDto,
      user,
    );
    return ResponseUtil.success(
      'Work report form submitted successfully',
      result.report,
      result.meta,
    );
  }
}
