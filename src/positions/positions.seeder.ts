// src/positions/positions.seeder.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position, PositionDocument } from './schemas/position.schema';

@Injectable()
export class PositionsSeeder implements OnApplicationBootstrap {
    constructor(
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
    ) { }

    async onApplicationBootstrap() {
        await this.seedPositions();
    }

    async seedPositions() {
        const count = await this.positionModel.countDocuments();
        if (count === 0) {
            console.log('Seeding initial positions...');

            const positionsToCreate = [
                { name: 'Client', description: 'User role for clients who create work orders.' },
                { name: 'Company Owner', description: 'Owner of a company account.' },
                { name: 'Company Manager', description: 'Manager within a company.' },
                { name: 'Company Staff', description: 'Staff member within a company.' },
                { name: 'Unassigned Staff', description: 'A staff member not yet assigned to any company.' },
            ];

            await this.positionModel.insertMany(positionsToCreate);
            console.log('Positions seeding completed.');
        }
    }
}