// src/invitations/invitations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from '../company/schemas/invitation.schemas'; // Gunakan skema yang ada
import { User, UserSchema } from '../users/schemas/user.schema'; // Impor skema User
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // Impor UsersModule

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Invitation.name, schema: InvitationSchema },
            { name: User.name, schema: UserSchema }, // Daftarkan User model
        ]),
        forwardRef(() => AuthModule), // Untuk AuthGuard
        UsersModule, // Impor UsersModule untuk inject UsersService jika perlu (opsional, bisa pakai UserModel langsung)
    ],
    controllers: [InvitationsController],
    providers: [InvitationsService],
    // Tidak perlu export service ini jika hanya dipakai internal modul
})
export class InvitationsModule { }