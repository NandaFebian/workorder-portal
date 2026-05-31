import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ServicePrice,
  ServicePriceDocument,
} from './schemas/service-price.schema';
import { CreateServicePriceDto } from './dto/create-service-price.dto';
import { UpdateServicePriceDto } from './dto/update-service-price.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Service, ServiceDocument } from 'src/service/schemas/service.schema';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';
import { getServicesWithAggregation } from 'src/service/helpers/service-aggregation.helper';
import { FormsService } from 'src/form/form.service';

@Injectable()
export class ServicePriceService {
  constructor(
    @InjectModel(ServicePrice.name)
    private priceModel: Model<ServicePriceDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private readonly formsService: FormsService,
  ) {}

  private async resolveLatestService(serviceId: string): Promise<any> {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new NotFoundException(`Invalid service ID: ${serviceId}`);
    }
    const svc = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(serviceId), deletedAt: null })
      .exec();
    if (!svc)
      throw new NotFoundException(`Service with ID ${serviceId} not found`);

    const latest = await this.serviceModel
      .findOne({ serviceKey: svc.serviceKey, deletedAt: null })
      .sort({ __v: -1 })
      .exec();
    return latest || svc;
  }

  private checkDepartmentAccess(user: AuthenticatedUser, service: any) {
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      if (
        !DepartmentAuthHelper.canManageService(
          user,
          service.workOrdersConfig ?? [],
        )
      ) {
        throw new ForbiddenException(
          'Department managers can only manage pricing for their services.',
        );
      }
    }
  }

  private async hydratePriceItem(price: any): Promise<any> {
    const services = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { serviceKey: price.serviceKey },
      false,
    );
    return {
      _id: price._id,
      service: services.length > 0 ? services[0] : null,
      price: price.price,
    };
  }

  async findAll(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id)
      throw new ForbiddenException('User is not associated with any company.');

    const companyServices = await getServicesWithAggregation(
      this.serviceModel,
      this.formsService,
      { companyId: user.company._id },
      true,
    );

    const filteredServices = DepartmentAuthHelper.filterServicesForUser(
      user,
      companyServices,
    );
    const serviceKeys = filteredServices.map((s: any) => s.serviceKey);

    const prices = await this.priceModel
      .find({ serviceKey: { $in: serviceKeys }, deletedAt: null })
      .lean()
      .exec();

    return prices.map((p: any) => {
      const svc = filteredServices.find(
        (s: any) => s.serviceKey === p.serviceKey,
      );
      return {
        _id: p._id,
        service: svc || null,
        price: p.price,
      };
    });
  }

  async create(
    dto: CreateServicePriceDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User is not associated with any company.');

    const service = await this.resolveLatestService(dto.serviceId);
    if (service.companyId.toString() !== user.company._id.toString()) {
      throw new ForbiddenException('Service does not belong to your company.');
    }
    this.checkDepartmentAccess(user, service);

    const existing = await this.priceModel.findOne({
      serviceKey: service.serviceKey,
      deletedAt: null,
    });
    if (existing) {
      throw new ConflictException(
        'A pricing configuration already exists for this service.',
      );
    }

    const created = await this.priceModel.create({
      serviceKey: service.serviceKey,
      price: dto.price,
    });

    return this.hydratePriceItem(created);
  }

  async update(
    id: string,
    dto: UpdateServicePriceDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User is not associated with any company.');
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid price config ID');

    const price = await this.priceModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!price) throw new NotFoundException('Service pricing config not found');

    const services = await this.serviceModel
      .find({
        serviceKey: price.serviceKey,
        companyId: user.company._id,
        deletedAt: null,
      })
      .exec();
    if (services.length === 0) {
      throw new ForbiddenException('Service does not belong to your company.');
    }
    const service = services[0];
    this.checkDepartmentAccess(user, service);

    if (dto.price !== undefined) price.price = dto.price;
    await price.save();

    return this.hydratePriceItem(price);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User is not associated with any company.');
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid price config ID');

    const price = await this.priceModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!price) throw new NotFoundException('Service pricing config not found');

    const services = await this.serviceModel
      .find({
        serviceKey: price.serviceKey,
        companyId: user.company._id,
        deletedAt: null,
      })
      .exec();
    if (services.length === 0) {
      throw new ForbiddenException('Service does not belong to your company.');
    }
    const service = services[0];
    this.checkDepartmentAccess(user, service);

    const result = await this.hydratePriceItem(price);
    price.deletedAt = new Date();
    await price.save();

    return result;
  }
}
