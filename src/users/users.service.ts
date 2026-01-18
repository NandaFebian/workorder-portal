// src/users/users.service.ts
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
        return this.userModel.findOne({ email, deletedAt: null }).select('+password').exec();
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
        // Note: Sesuaikan populate jika diperlukan di guard atau tempat lain
        return this.userModel.findOne({ _id: id, deletedAt: null });
    }

    // Method untuk mendapatkan semua user berdasarkan companyId dengan filter role
    async findAllByCompanyId(
        companyId: Types.ObjectId,
        rolesToInclude?: string[] // Tambahkan parameter opsional untuk filter role
    ): Promise<UserDocument[]> {
        const query: any = { companyId, deletedAt: null };

        // Jika rolesToInclude diberikan dan tidak kosong, tambahkan filter $in
        if (rolesToInclude && rolesToInclude.length > 0) {
            query.role = { $in: rolesToInclude };
        }

        return this.userModel.find(query)
            .populate('positionId', 'name') // Populate posisi agar lebih informatif
            .select('-password') // Jangan sertakan password secara default
            .sort({ createdAt: -1 })
            .exec();
    }
}