import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ServicesService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }

    async create(
        createServiceDto: CreateServiceDto,
        user: UserDocument,
    ): Promise<ServiceDocument> {
        const newService = new this.serviceModel({
            ...createServiceDto,
            companyId: user.companyId,
        });
        return newService.save();
    }

    async findAll(user: UserDocument): Promise<ServiceDocument[]> {
        return this.serviceModel
            .find({ companyId: user.companyId })
            .populate('requiredStaff.position')
            .exec();
    }

    async findOne(id: string, user: UserDocument): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel
            .findById(id)
            .populate('requiredStaff.position')
            .exec();
        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        if (service.companyId.toString() !== user.companyId.toString()) {
            throw new ForbiddenException(
                "You don't have permission to access this service",
            );
        }
        return service;
    }
}