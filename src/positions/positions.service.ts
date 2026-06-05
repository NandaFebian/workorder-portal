// src/positions/positions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
  ) {}

  async findAll(user?: AuthenticatedUser) {
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException(
          'User is not associated with any company.',
        );
      }
      return this.positionModel
        .find({
          deletedAt: null,
          $or: [
            { companyId: user.company._id },
            { companyId: null }, // Global positions
          ],
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }
    return this.positionModel
      .find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(
    id: string,
    user?: AuthenticatedUser,
  ): Promise<PositionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid position ID: ${id}`);
    }
    const position = await this.positionModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    // For non-admin users, enforce company scope
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException(
          'User is not associated with any company.',
        );
      }
      // Allow if position belongs to user's company OR is a global position (companyId null)
      if (
        position.companyId &&
        position.companyId.toString() !== user.company._id.toString()
      ) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }
    }
    return position;
  }

  async create(
    createPositionDto: CreatePositionDto,
    user?: AuthenticatedUser,
  ): Promise<PositionDocument> {
    // If user is provided and not admin_app, add company context
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException(
          'User is not associated with any company.',
        );
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

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    user?: AuthenticatedUser,
  ): Promise<PositionDocument> {
    const existingPosition = await this.findById(id);

    // Check if user has permission to update this position
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException(
          'User is not associated with any company.',
        );
      }
      if (
        existingPosition.companyId &&
        existingPosition.companyId.toString() !== user.company._id.toString()
      ) {
        throw new ForbiddenException(
          'You do not have permission to update this position.',
        );
      }
    }

    Object.assign(existingPosition, updatePositionDto);
    return existingPosition.save();
  }

  /**
   * Validate that a position can be safely deleted.
   * Returns an error message string if deletion is blocked, or null if safe.
   */
  private async _validateDeletion(positionId: string): Promise<string | null> {
    const db = this.positionModel.db;
    const posObjId = new Types.ObjectId(positionId);

    // 1. Check no employees assigned
    const employeeCount = await db
      .collection('users')
      .countDocuments({ positionId: posObjId, deletedAt: null });
    if (employeeCount > 0) {
      return `Departemen tidak dapat dihapus karena masih memiliki ${employeeCount} karyawan yang terdaftar.`;
    }

    // 2. Check no forms linked
    const formCount = await db
      .collection('formtemplates')
      .countDocuments({ position: posObjId, deletedAt: null });
    if (formCount > 0) {
      return 'Departemen tidak dapat dihapus karena masih memiliki formulir yang terkait.';
    }

    // 3. Check not used in any service's workOrdersConfig
    const serviceCount = await db.collection('services').countDocuments({
      'workOrdersConfig.positionId': posObjId,
      deletedAt: null,
    });
    if (serviceCount > 0) {
      return 'Departemen tidak dapat dihapus karena masih digunakan dalam konfigurasi layanan.';
    }

    return null;
  }

  /**
   * Check if a position can be deleted by the given user.
   */
  async canDelete(
    positionId: string,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    if (user.role !== Role.CompanyOwner && user.role !== 'admin_app') {
      return false;
    }
    const error = await this._validateDeletion(positionId);
    return error === null;
  }

  async remove(
    id: string,
    user?: AuthenticatedUser,
  ): Promise<PositionDocument> {
    const existingPosition = await this.findById(id);

    // Check if user has permission to delete this position
    if (user && user.role !== 'admin_app') {
      if (!user.company?._id) {
        throw new ForbiddenException(
          'User is not associated with any company.',
        );
      }
      if (
        existingPosition.companyId &&
        existingPosition.companyId.toString() !== user.company._id.toString()
      ) {
        throw new ForbiddenException(
          'You do not have permission to delete this position.',
        );
      }
    }

    // Validate deletion constraints
    const validationError = await this._validateDeletion(id);
    if (validationError) {
      throw new UnprocessableEntityException(validationError);
    }

    // Soft delete: set deletedAt to current timestamp
    const deletedAt = new Date();
    existingPosition.deletedAt = deletedAt;
    return existingPosition.save();
  }
}

