import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { MembershipCode, MembershipCodeSchema } from './schemas/membership.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: MembershipCode.name, schema: MembershipCodeSchema }]),
        AuthModule,
        UsersModule,
    ],
    controllers: [MembershipController],
    providers: [MembershipService],
})
export class MembershipModule { }
