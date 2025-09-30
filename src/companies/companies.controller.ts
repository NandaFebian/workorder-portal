import { Controller, Get, HttpCode, HttpStatus, Param, Put, Body, UseGuards } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        const companies = await this.companiesService.findAll();
        return {
            message: 'Companies retrieved successfully',
            meta: {
                total: companies.length,
            },
            data: {
                companies: companies,
            }
        };
    }

    // Endpoint untuk mengupdate perusahaan berdasarkan ID
    @Put(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        const company = await this.companiesService.update(id, updateCompanyDto);
        return {
            message: 'Company updated successfully',
            data: {
                company: company,
            }
        };
    }

    // Endpoint untuk mendapatkan perusahaan berdasarkan ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const company = await this.companiesService.findById(id);
        return {
            message: 'Company retrieved successfully',
            data: {
                company: company,
            }
        };
    }
}