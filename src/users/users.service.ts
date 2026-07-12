// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResource } from './resources/user.resource';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async updateCompanyId(
    userId: Types.ObjectId,
    companyId: Types.ObjectId,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { companyId: companyId } },
    );
  }
  findById(id: any) {
    return this.userModel.findOne({ _id: id });
  }

  /**
   * Search users that are available to be invited as employees, i.e. users with
   * role `staff_unassigned` that do not yet belong to any company. Matches the
   * email against the keyword (case-insensitive, partial). Intended for the
   * invite flow so owners/managers can look up an unassigned staff by email.
   */
  async searchAvailableUnassignedStaffByEmail(
    emailKeyword: string,
    limit = 10,
  ): Promise<any[]> {
    // Escape regex special characters so the keyword is matched literally.
    const escaped = emailKeyword
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = new RegExp(escaped, 'i');

    return this.userModel
      .find({
        role: Role.UnassignedStaff,
        companyId: null,
        deletedAt: null,
        email: { $regex: emailRegex },
      })
      .select('_id name email role createdAt')
      .sort({ email: 1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async findByPositionId(positionId: string): Promise<any[]> {
    return this.userModel
      .find({ positionId: new Types.ObjectId(positionId) })
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findAllByCompanyId(
    companyId: Types.ObjectId,
    rolesToInclude?: string[],
  ): Promise<any[]> {
    const query: any = { companyId };

    if (rolesToInclude && rolesToInclude.length > 0) {
      query.role = { $in: rolesToInclude };
    }

    return this.userModel
      .find(query)
      .populate('positionId', 'name')
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel
      .findOne({ _id: userId })
      .populate('companyId', 'name address description')
      .populate('positionId', 'name description')
      .select('-password')
      .exec();

    if (!user) throw new NotFoundException('User not found');
    return UserResource.transformUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<any> {
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('+password')
      .exec();

    if (!user) throw new NotFoundException('User not found');

    // Handle password change
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'currentPassword diperlukan untuk mengganti password.',
        );
      }
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Password saat ini tidak sesuai.');
      }
      user.password = dto.newPassword; // Will be hashed by pre-save hook
    }

    // Handle email change — check uniqueness
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel
        .findOne({ email: dto.email })
        .exec();
      if (existing && (existing._id as any).toString() !== userId) {
        throw new ConflictException(
          'Email sudah digunakan oleh pengguna lain.',
        );
      }
      user.email = dto.email;
    }

    if (dto.name) user.name = dto.name;

    await user.save();

    return this.getProfile(userId);
  }
}
