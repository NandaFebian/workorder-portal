import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkReportService } from './work-report.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { SubmitWorkReportFormDto } from './dto/submit-work-report-form.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
// import { RolesGuard } from 'src/auth/guards/roles.guard'; // Jika perlu role specific

@ApiTags('Work Reports')
@ApiBearerAuth('access-token')
@Controller('workreports')
@UseGuards(AuthGuard) // Amankan endpoint dengan token
export class WorkReportController {
  constructor(private readonly workReportService: WorkReportService) {}

  // GET {{base_url}}/workreports/{{id}}
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a work report by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.workReportService.findOne(id);
    return {
      message: 'Work report retrieved successfully',
      data,
    };
  }

  // POST {{base_url}}/workreports (Manual Creation jika diperlukan)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a work report (manual)' })
  async create(@Body() createDto: CreateWorkReportDto) {
    const data = await this.workReportService.create(createDto);
    return {
      message: 'Work report created successfully',
      data,
    };
  }

  // PUT {{base_url}}/workreports/{{id}}
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a work report' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkReportDto,
  ) {
    const data = await this.workReportService.update(id, updateDto);
    return {
      message: 'Work report updated successfully',
      data,
    };
  }

  // POST {{base_url}}/workreports/:id/submit
  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit the work report form' })
  async submitForm(
    @Param('id') workReportId: string,
    @Body() submitDto: SubmitWorkReportFormDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Override workReportId from params
    const dto = { ...submitDto, workReportId };
    const result = await this.workReportService.submitReportForm(dto, user);
    return ResponseUtil.success(
      'Work report form submitted successfully',
      result,
    );
  }

  @Patch(':id/sent')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a work report as sent' })
  async markAsSent(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.workReportService.markAsSent(id, user);
    return ResponseUtil.success('Work report marked as sent', data);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a work report' })
  async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.workReportService.approve(id, user);
    return ResponseUtil.success('Work report approved', data);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a work report' })
  async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.workReportService.reject(id, user);
    return ResponseUtil.success('Work report rejected', data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Delete a work report' })
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.workReportService.remove(id, user);
    return ResponseUtil.success('Work report deleted successfully', data);
  }
}
