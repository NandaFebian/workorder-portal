import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true, select: false }) // 'select: false' agar password tidak ter-return by default
    password: string;

    @Prop({
        required: true,
        enum: ['client', 'admin_app', 'owner_company', 'manager_company', 'staff_company'],
    })
    role: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', default: null })
    positionId: MongooseSchema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware (hook) untuk hash password sebelum menyimpan user baru
UserSchema.pre<UserDocument>('save', async function (next) {
    // Hanya hash password jika field-nya dimodifikasi (atau baru)
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});