// src/positions/positions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class PositionsService {
    constructor(
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>
    ) { }

    async findAll(user?: AuthenticatedUser) {
        if (user && user.role !== 'admin_app') {
            if (!user.company?._id) {
                throw new ForbiddenException('User is not associated with any company.');
            }
            return this.positionModel.find({
                isActive: true,
                $or: [
                    { companyId: user.company._id },
                    { companyId: null } // Global positions
                ]
            }).sort({ createdAt: -1 }).exec();
        }
        return this.positionModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
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

    async create(createPositionDto: CreatePositionDto, user?: AuthenticatedUser): Promise<PositionDocument> {
        // If user is provided and not admin_app, add company context
        if (user && user.role !== 'admin_app') {
            if (!user.company?._id) {
                throw new ForbiddenException('User is not associated with any company.');
            }
            const newPosition = new this.positionModel({
                ...createPositionDto,
                companyId: user.company._id,
            });
            return newPosition.save();
        }

        // For admin_app or when no user context
        const newPosition = new this.positionModel(createPositionDto);
        return newPosition.save();
    }

    async update(id: string, updatePositionDto: UpdatePositionDto, user?: AuthenticatedUser): Promise<PositionDocument> {
        const existingPosition = await this.findById(id);

        // Check if user has permission to update this position
        if (user && user.role !== 'admin_app') {
            if (!user.company?._id) {
                throw new ForbiddenException('User is not associated with any company.');
            }
            if (existingPosition.companyId && existingPosition.companyId.toString() !== user.company._id.toString()) {
                throw new ForbiddenException('You do not have permission to update this position.');
            }
        }

        Object.assign(existingPosition, updatePositionDto);
        return existingPosition.save();
    }

    async remove(id: string, user?: AuthenticatedUser): Promise<void> {
        const existingPosition = await this.findById(id);

        // Check if user has permission to delete this position
        if (user && user.role !== 'admin_app') {
            if (!user.company?._id) {
                throw new ForbiddenException('User is not associated with any company.');
            }
            if (existingPosition.companyId && existingPosition.companyId.toString() !== user.company._id.toString()) {
                throw new ForbiddenException('You do not have permission to delete this position.');
            }
        }

        const result = await this.positionModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Position with ID ${id} not found`);
        }
    }
}