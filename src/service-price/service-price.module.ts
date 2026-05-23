import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicePrice, ServicePriceSchema } from './schemas/service-price.schema';
import { ServicePriceController } from './service-price.controller';
import { ServicePriceService } from './service-price.service';
import { Service, ServiceSchema } from 'src/service/schemas/service.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { FormModule } from 'src/form/form.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServicePrice.name, schema: ServicePriceSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    forwardRef(() => FormModule),
  ],
  controllers: [ServicePriceController],
  providers: [ServicePriceService],
  exports: [ServicePriceService],
})
export class ServicePriceModule {}
