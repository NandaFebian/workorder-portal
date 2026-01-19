import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { WorkReportService } from './work-report.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { SubmitWorkReportFormDto } from './dto/submit-work-report-form.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
// import { RolesGuard } from 'src/auth/guards/roles.guard'; // Jika perlu role specific

@Controller('workreports')
@UseGuards(AuthGuard) // Amankan endpoint dengan token
export class WorkReportController {
    constructor(private readonly workReportService: WorkReportService) { }

    // GET {{base_url}}/workreports/{{id}}
    @Get(':id')
    @HttpCode(HttpStatus.OK)
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
    async update(@Param('id') id: string, @Body() updateDto: UpdateWorkReportDto) {
        const data = await this.workReportService.update(id, updateDto);
        return {
            message: 'Work report updated successfully',
            data,
        };
    }

    // POST {{base_url}}/workreports/:id/submit
    @Post(':id/submit')
    @UseGuards(RolesGuard)
    @Roles('owner_company', 'manager_company', 'staff_company')
    @HttpCode(HttpStatus.OK)
    async submitForm(
        @Param('id') workReportId: string,
        @Body() submitDto: SubmitWorkReportFormDto,
        @GetUser() user: AuthenticatedUser
    ) {
        // Override workReportId from params
        const dto = { ...submitDto, workReportId };
        const result = await this.workReportService.submitReportForm(dto, user);
        return ResponseUtil.success('Work report form submitted successfully', result);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        await this.workReportService.remove(id);
        return ResponseUtil.success('Work report deleted successfully', null);
    }
}