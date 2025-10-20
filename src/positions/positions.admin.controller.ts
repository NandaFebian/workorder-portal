// src/positions/positions.admin.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Put,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('positions')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin_app')
export class PositionsAdminController {
    constructor(private readonly positionsService: PositionsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPositionDto: CreatePositionDto) {
        const position = await this.positionsService.create(createPositionDto);
        return {
            message: 'Position created successfully',
            data: position,
        };
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        const position = await this.positionsService.update(id, updatePositionDto);
        return {
            message: 'Position updated successfully',
            data: position,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        await this.positionsService.remove(id);
        return { message: 'Position deleted successfully' };
    }
}