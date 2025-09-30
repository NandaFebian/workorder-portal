import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';

@Injectable()
export class PositionsService {
    constructor(
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>
    ) { }

    async findAll() {
        return this.positionModel.find({ isActive: true }).exec();
    }

    async findById(id: string) {
        return this.positionModel.findById(id).exec();
    }
}
