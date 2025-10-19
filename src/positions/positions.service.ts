// src/positions/positions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
    constructor(
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>
    ) { }

    async findAll() {
        return this.positionModel.find({ isActive: true }).exec();
    }

    async findById(id: string): Promise<PositionDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid position ID: ${id}`);
        }
        const position = await this.positionModel.findById(id).exec();
        if (!position) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
        return position;
    }

    async create(createPositionDto: CreatePositionDto): Promise<PositionDocument> {
        const newPosition = new this.positionModel(createPositionDto);
        return newPosition.save();
    }

    async update(id: string, updatePositionDto: UpdatePositionDto): Promise<PositionDocument> {
        const existingPosition = await this.findById(id);
        Object.assign(existingPosition, updatePositionDto);
        return existingPosition.save();
    }

    async remove(id: string): Promise<void> {
        const result = await this.positionModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
    }
}