// src/positions/positions.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
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
}