import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FcmService } from './fcm.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [FcmService],
  exports: [FcmService],
})
export class FcmModule {}
