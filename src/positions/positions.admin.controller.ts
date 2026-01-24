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
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('positions')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.AppAdmin, Role.CompanyOwner, Role.CompanyManager)
export class PositionsAdminController {
    constructor(private readonly positionsService: PositionsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createPositionDto: CreatePositionDto,
        @GetUser() user: AuthenticatedUser
    ) {
        const position = await this.positionsService.create(createPositionDto, user);
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
        @GetUser() user: AuthenticatedUser
    ) {
        const position = await this.positionsService.update(id, updatePositionDto, user);
        return {
            message: 'Position updated successfully',
            data: position,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Param('id') id: string,
        @GetUser() user: AuthenticatedUser
    ) {
        const data = await this.positionsService.remove(id, user);
        return ResponseUtil.success('Position deleted successfully', data);
    }
}