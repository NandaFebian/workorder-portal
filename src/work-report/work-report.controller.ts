import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { WorkReportService } from './work-report.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
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
}