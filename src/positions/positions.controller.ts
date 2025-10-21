// src/positions/positions.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('public/positions')
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        const positions = await this.positionsService.findAll();
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