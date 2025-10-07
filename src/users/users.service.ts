import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
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
    // Method untuk mengupdate companyId user
    async updateCompanyId(userId: Types.ObjectId, companyId: Types.ObjectId): Promise<void> {
        await this.userModel.updateOne({ _id: userId }, { $set: { companyId: companyId } });
    }
    // Method untuk mencari user berdasarkan ID
    findById(id: any) {
        return this.userModel.findById(id);
    }
    // Method untuk mendapatkan semua user berdasarkan companyId
    async findAllByCompanyId(companyId: Types.ObjectId): Promise<UserDocument[]> {
        return this.userModel.find({ companyId })
            .populate('positionId', 'name') // Populate posisi agar lebih informatif
            .exec();
    }
}