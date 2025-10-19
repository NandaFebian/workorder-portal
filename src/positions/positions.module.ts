// src/positions/positions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from './schemas/position.schema';
import { PositionsController } from './positions.controller';
import { PositionsAdminController } from './positions.admin.controller';
import { PositionsService } from './positions.service';
import { PositionsSeeder } from './positions.seeder';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }]),
        forwardRef(() => AuthModule),
        UsersModule,
    ],
    controllers: [
        PositionsController,       // Handles public GET requests
        PositionsAdminController
    ],
    providers: [
        PositionsService,
        PositionsSeeder
    ],
    exports: [PositionsService],
})
export class PositionsModule { }