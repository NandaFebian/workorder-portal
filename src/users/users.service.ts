import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findOneByEmail(email: string): Promise<UserDocument | null> {
        //password untuk perbandingan, jadi gunakan .select('+password')
        return this.userModel.findOne({ email }).select('+password').exec();
    }
    // Method untuk membuat user baru (register)
    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const newUser = new this.userModel(createUserDto);
        return newUser.save();
    }

    async updateCompanyId(userId: Types.ObjectId, companyId: Types.ObjectId): Promise<void> {
        await this.userModel.updateOne({ _id: userId }, { $set: { companyId: companyId } });
    }
}