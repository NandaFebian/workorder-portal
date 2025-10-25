// src/positions/positions.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('positions')
@UseGuards(AuthGuard)
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser) {
        const positions = await this.positionsService.findAll(user);
        return {
            message: 'Positions retrieved successfully',
            data: positions,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const position = await this.positionsService.findById(id);
        return {
            message: 'Position retrieved successfully',
            data: position,
        };
    }
}