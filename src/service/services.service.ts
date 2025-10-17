import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class ServicesService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }

    async create(
        createServiceDto: CreateServiceDto,
        user: AuthenticatedUser,
    ): Promise<ServiceDocument> {
        // Perbaikan 2: Tambahkan pengecekan untuk user.company
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        const newService = new this.serviceModel({
            ...createServiceDto,
            companyId: user.company._id,
        });
        return newService.save();
    }

    async findAll(user: AuthenticatedUser): Promise<ServiceDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        return this.serviceModel
            .find({ companyId: user.company._id })
            .populate([
                { path: 'requiredStaff.position', select: 'name' },
                { path: 'workOrderForms.form' },
                { path: 'reportForms.form' },
            ])
            .exec();
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }

        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel
            .findById(id)
            .populate([
                { path: 'requiredStaff.position', select: 'name' },
            ])
            .exec();

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        if (service.companyId.toString() !== user.company._id.toString()) {
            throw new ForbiddenException(
                "You don't have permission to access this service",
            );
        }
        return service;
    }

    // Perbaikan 1: Tambahkan metode findAllByCompanyId untuk mengambil layanan publik berdasarkan companyId
    async findAllByCompanyId(companyId: string): Promise<ServiceDocument[]> {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new NotFoundException(`Invalid company ID: ${companyId}`);
        }
        return this.serviceModel
            .find({ companyId: new Types.ObjectId(companyId), isActive: true, accessType: 'public' })
            .populate('requiredStaff.position', 'name')
            .exec();
    }

    // Perbaikan 3: Tambahkan metode findById untuk mengambil layanan publik berdasarkan ID
    async findById(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel
            .findById(id)
            .populate([
                { path: 'requiredStaff.position', select: 'name' },
            ])
            .exec();

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }
}