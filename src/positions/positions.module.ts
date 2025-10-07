// src/positions/positions.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from './schemas/position.schema';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { PositionsSeeder } from './positions.seeder'; // <-- 1. Impor seeder

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }]),
    ],
    controllers: [PositionsController],
    providers: [
        PositionsService,
        PositionsSeeder // <-- 2. Daftarkan seeder sebagai provider
    ],
    exports: [PositionsService], // Ekspor service agar bisa dipakai modul lain
})
export class PositionsModule { }