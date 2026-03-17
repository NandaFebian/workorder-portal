// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email, deletedAt: null })
      .select('+password')
      .exec();
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
    return this.userModel.findOne({ _id: id, deletedAt: null });
  }

  async findByPositionId(positionId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ positionId: new Types.ObjectId(positionId), deletedAt: null })
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllByCompanyId(
    companyId: Types.ObjectId,
    rolesToInclude?: string[],
  ): Promise<UserDocument[]> {
    const query: any = { companyId, deletedAt: null };

    if (rolesToInclude && rolesToInclude.length > 0) {
      query.role = { $in: rolesToInclude };
    }

    return this.userModel
      .find(query)
      .populate('positionId', 'name')
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }
}
