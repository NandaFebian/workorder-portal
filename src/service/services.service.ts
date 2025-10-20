// src/service/services.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ServicesService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }

    async create(
        createServiceDto: CreateServiceDto,
        user: AuthenticatedUser,
    ): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        const newService = new this.serviceModel({
            ...createServiceDto,
            serviceKey: uuidv4(),
            companyId: user.company._id,
            __v: 0,
        });
        return newService.save();
    }

    async findAll(user: AuthenticatedUser): Promise<ServiceDocument[]> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        return this.serviceModel.aggregate([
            { $match: { companyId: user.company._id } },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$serviceKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);
    }

    async findByVersionId(id: string, user: AuthenticatedUser): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel.findById(id).populate([
            { path: 'requiredStaff.positionId', select: 'name' },
            { path: 'workOrderForms.formId' },
            { path: 'reportForms.formId' },
            { path: 'workOrderForms.fillableByPositionIds', select: 'name' },
            { path: 'workOrderForms.viewableByPositionIds', select: 'name' },
            { path: 'reportForms.fillableByPositionIds', select: 'name' },
            { path: 'reportForms.viewableByPositionIds', select: 'name' },
        ]).exec();

        if (!service || service.companyId.toString() !== user.company._id.toString()) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }

    async update(serviceKey: string, dto: UpdateServiceDto, user: AuthenticatedUser): Promise<ServiceDocument> {
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        const latestVersion = await this.serviceModel.findOne({
            serviceKey,
            companyId: user.company._id
        }).sort({ __v: -1 }).exec();

        if (!latestVersion) {
            throw new NotFoundException(`Service with key ${serviceKey} not found`);
        }

        const newVersionData = {
            ...latestVersion.toObject(),
            ...dto,
            _id: undefined,
            __v: latestVersion.__v + 1,
        };

        const newVersion = new this.serviceModel(newVersionData);
        return newVersion.save();
    }

    // --- Client Methods ---
    async findAllByCompanyId(companyId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(companyId)) {
            throw new NotFoundException(`Invalid company ID: ${companyId}`);
        }
        const latestPublicServices = await this.serviceModel.aggregate([
            {
                $match: {
                    companyId: new Types.ObjectId(companyId),
                    isActive: true,
                    accessType: 'public'
                }
            },
            { $sort: { __v: -1 } },
            {
                $group: {
                    _id: '$serviceKey',
                    latest_doc: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$latest_doc' } }
        ]);

        if (latestPublicServices.length === 0) {
            return [];
        }

        return this.serviceModel.populate(latestPublicServices, [
            { path: 'requiredStaff.positionId', select: 'name' },
            { path: 'workOrderForms.formId', select: 'title description formType' },
            { path: 'reportForms.formId', select: 'title description formType' },
        ]);
    }

    async findById(id: string): Promise<ServiceDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid service ID: ${id}`);
        }
        const service = await this.serviceModel.findById(id).populate([
            { path: 'requiredStaff.positionId', select: 'name' },
            { path: 'workOrderForms.formId' },
            { path: 'reportForms.formId' },
            { path: 'workOrderForms.fillableByPositionIds', select: 'name' },
            { path: 'workOrderForms.viewableByPositionIds', select: 'name' },
            { path: 'reportForms.fillableByPositionIds', select: 'name' },
            { path: 'reportForms.viewableByPositionIds', select: 'name' },
        ]).exec();

        if (!service || !service.isActive || service.accessType !== 'public') {
            throw new NotFoundException(`Service with ID ${id} not found or is not public`);
        }
        return service;
    }
}