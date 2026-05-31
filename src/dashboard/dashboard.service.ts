import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ServiceRequestDocument,
  ServiceRequest,
} from '../service-request/schemas/service-request.schema';
import {
  WorkOrderDocument,
  WorkOrder,
} from '../work-order/schemas/work-order.schema';
import {
  WorkReportDocument,
  WorkReport,
} from '../work-report/schemas/work-report.schema';
import {
  NotificationDocument,
  Notification,
} from '../fcm/schemas/notification.schema';
import { UserDocument, User } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';
import { ServiceRequestStatus } from '../common/enums/service-request-status.enum';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';
import { WorkReportStatus } from '../common/enums/work-report-status.enum';
import {
  FormTemplate,
  FormTemplateDocument,
} from '../form/schemas/form-template.schema';
import { Service, ServiceDocument } from '../service/schemas/service.schema';
import {
  Position,
  PositionDocument,
} from '../positions/schemas/position.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private readonly serviceRequestModel: Model<ServiceRequestDocument>,
    @InjectModel(WorkOrder.name)
    private readonly workOrderModel: Model<WorkOrderDocument>,
    @InjectModel(WorkReport.name)
    private readonly workReportModel: Model<WorkReportDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(FormTemplate.name)
    private readonly formTemplateModel: Model<FormTemplateDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,
  ) {}

  private getDateRange(periodType: string): { $gte: Date; $lte: Date } {
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (periodType) {
      case 'current_week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        break;
      }
      case 'current_month':
        startDate.setDate(1);
        break;
      case 'current_year':
        startDate.setMonth(0, 1);
        break;
      case 'current_day':
      default:
        break;
    }

    return { $gte: startDate, $lte: endDate };
  }

  async getServiceRequestDashboard(
    user: UserDocument,
    periodType: string = 'current_day',
  ) {
    const userId = new Types.ObjectId(user._id as string);
    const dateRange = this.getDateRange(periodType);

    const matchQuery: any = { createdAt: dateRange };

    if (user.role === Role.Client) {
      matchQuery.requestedBy = userId;
    } else if (
      [Role.CompanyOwner, Role.CompanyManager].includes(user.role as Role)
    ) {
      const companyId = user.companyId || (user as any).company?._id;
      if (!companyId) throw new ForbiddenException('No company associated');
      matchQuery.companyId = new Types.ObjectId(companyId as unknown as string);
    } else if (
      user.role === Role.CompanyStaff ||
      user.role === Role.UnassignedStaff
    ) {
      const companyId = user.companyId || (user as any).company?._id;
      if (!companyId) throw new ForbiddenException('No company associated');
      matchQuery.companyId = new Types.ObjectId(companyId as unknown as string);
    } else {
      throw new ForbiddenException('No dashboard available for this role');
    }

    const srStats = await this.serviceRequestModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$serviceRequestStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCount = {
      received: 0,
      cancelled: 0,
      rejected: 0,
      approved: 0,
      on_progress: 0,
      completed: 0,
      unprocessable: 0,
      partial_completed: 0,
      closed: 0,
    };

    let totalCount = 0;

    srStats.forEach((stat) => {
      totalCount += stat.count;
      switch (stat._id) {
        case ServiceRequestStatus.RECEIVED:
          statusCount.received = stat.count;
          break;
        case ServiceRequestStatus.CANCELLED:
          statusCount.cancelled = stat.count;
          break;
        case ServiceRequestStatus.REJECTED:
          statusCount.rejected = stat.count;
          break;
        case ServiceRequestStatus.APPROVED:
          statusCount.approved = stat.count;
          break;
        case ServiceRequestStatus.ON_PROGRESS:
          statusCount.on_progress = stat.count;
          break;
        case ServiceRequestStatus.COMPLETED:
          statusCount.completed = stat.count;
          break;
        case ServiceRequestStatus.UNPROCESSABLE:
          statusCount.unprocessable = stat.count;
          break;
        case ServiceRequestStatus.PARTIAL_COMPLETED:
          statusCount.partial_completed = stat.count;
          break;
        case ServiceRequestStatus.CLOSED:
          statusCount.closed = stat.count;
          break;
      }
    });

    return {
      status_count: statusCount,
      total_count: totalCount,
    };
  }

  async getWorkOrderDashboard(
    user: UserDocument,
    periodType: string = 'current_day',
  ) {
    const userId = new Types.ObjectId(user._id as string);
    const dateRange = this.getDateRange(periodType);

    const matchQuery: any = { createdAt: dateRange };

    if (user.role === Role.Client) {
      throw new ForbiddenException(
        'Clients do not have a work order dashboard',
      );
    } else if (
      [Role.CompanyOwner, Role.CompanyManager].includes(user.role as Role)
    ) {
      const companyId = user.companyId || (user as any).company?._id;
      if (!companyId) throw new ForbiddenException('No company associated');
      matchQuery.companyId = new Types.ObjectId(companyId as unknown as string);
    } else if (
      user.role === Role.CompanyStaff ||
      user.role === Role.UnassignedStaff
    ) {
      matchQuery.assignedStaff = { $in: [userId] };
    } else {
      throw new ForbiddenException('No dashboard available for this role');
    }

    const woStats = await this.workOrderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCount = {
      drafted: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      on_progress: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
    };

    let totalCount = 0;

    woStats.forEach((stat) => {
      totalCount += stat.count;
      switch (stat._id) {
        case WorkOrderStatus.DRAFTED:
          statusCount.drafted = stat.count;
          break;
        case WorkOrderStatus.SENT:
          statusCount.sent = stat.count;
          break;
        case WorkOrderStatus.APPROVED:
          statusCount.approved = stat.count;
          break;
        case WorkOrderStatus.REJECTED:
          statusCount.rejected = stat.count;
          break;
        case WorkOrderStatus.ON_PROGRESS:
          statusCount.on_progress = stat.count;
          break;
        case WorkOrderStatus.COMPLETED:
          statusCount.completed = stat.count;
          break;
        case WorkOrderStatus.CANCELLED:
          statusCount.cancelled = stat.count;
          break;
        case WorkOrderStatus.FAILED:
          statusCount.failed = stat.count;
          break;
      }
    });

    return {
      status_count: statusCount,
      total_count: totalCount,
    };
  }

  async getCompanyDashboard(user: UserDocument) {
    if (user.role !== Role.CompanyOwner) {
      throw new ForbiddenException('Only owner can access company dashboard');
    }

    const companyId = user.companyId || (user as any).company?._id;
    if (!companyId) throw new ForbiddenException('No company associated');
    const compIdObj = new Types.ObjectId(companyId as unknown as string);

    // forms_stat
    const forms = await this.formTemplateModel.aggregate([
      { $match: { companyId: compIdObj } },
      { $group: { _id: { $eq: ['$deletedAt', null] }, count: { $sum: 1 } } },
    ]);
    let activeForms = 0;
    let inActiveForms = 0;
    forms.forEach((f) => {
      if (f._id) activeForms = f.count;
      else inActiveForms = f.count;
    });

    // services_stat
    const services = await this.serviceModel.aggregate([
      { $match: { companyId: compIdObj } },
      { $group: { _id: '$isActive', count: { $sum: 1 } } },
    ]);
    let activeServices = 0;
    let inActiveServices = 0;
    services.forEach((s) => {
      if (s._id) activeServices = s.count;
      else inActiveServices = s.count;
    });

    // positions_stat
    const positions = await this.positionModel.aggregate([
      { $match: { companyId: compIdObj } },
      { $group: { _id: '$isActive', count: { $sum: 1 } } },
    ]);
    let activePositions = 0;
    let inActivePositions = 0;
    positions.forEach((p) => {
      if (p._id) activePositions = p.count;
      else inActivePositions = p.count;
    });

    // employees_stat
    const employees = await this.userModel.aggregate([
      { $match: { companyId: compIdObj } },
      {
        $group: {
          _id: { active: { $eq: ['$deletedAt', null] }, role: '$role' },
          count: { $sum: 1 },
        },
      },
    ]);
    let activeEmployees = 0;
    let inActiveEmployees = 0;
    let managersCount = 0;
    let staffsCount = 0;

    employees.forEach((e) => {
      const { active, role } = e._id;
      if (active) activeEmployees += e.count;
      else inActiveEmployees += e.count;

      if (active) {
        if (role === Role.CompanyManager) managersCount += e.count;
        else if (role === Role.CompanyStaff || role === Role.UnassignedStaff)
          staffsCount += e.count;
      }
    });

    return {
      forms_stat: {
        active: activeForms,
        inActive: inActiveForms,
        total: activeForms + inActiveForms,
      },
      services_stat: {
        active: activeServices,
        inActive: inActiveServices,
        total: activeServices + inActiveServices,
      },
      positions_stat: {
        active: activePositions,
        inActive: inActivePositions,
        total: activePositions + inActivePositions,
      },
      employees_stat: {
        total: activeEmployees + inActiveEmployees,
        managers_count: managersCount,
        staffs_count: staffsCount,
      },
    };
  }
}
