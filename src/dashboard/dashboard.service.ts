import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceRequestDocument, ServiceRequest } from '../service-request/schemas/service-request.schema';
import { WorkOrderDocument, WorkOrder } from '../work-order/schemas/work-order.schema';
import { WorkReportDocument, WorkReport } from '../work-report/schemas/work-report.schema';
import { NotificationDocument, Notification } from '../fcm/schemas/notification.schema';
import { UserDocument, User } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';
import { ServiceRequestStatus } from '../common/enums/service-request-status.enum';
import { WorkOrderStatus } from '../common/enums/work-order-status.enum';
import { WorkReportStatus } from '../common/enums/work-report-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(ServiceRequest.name) private readonly serviceRequestModel: Model<ServiceRequestDocument>,
    @InjectModel(WorkOrder.name) private readonly workOrderModel: Model<WorkOrderDocument>,
    @InjectModel(WorkReport.name) private readonly workReportModel: Model<WorkReportDocument>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async getDashboardSummary(user: UserDocument) {
    switch (user.role) {
      case Role.Client:
        return this.getClientSummary(user);
      case Role.CompanyStaff:
      case Role.UnassignedStaff:
        return this.getStaffSummary(user);
      case Role.CompanyManager:
        return this.getManagerSummary(user);
      case Role.CompanyOwner:
        return this.getOwnerSummary(user);
      default:
        throw new ForbiddenException('No dashboard available for this role');
    }
  }

  private async getClientSummary(user: UserDocument) {
    const userId = new Types.ObjectId(user._id as unknown as string);

    const [srStats, unreadNotifications] = await Promise.all([
      this.serviceRequestModel.aggregate([
        { $match: { requestedBy: userId } },
        {
          $group: {
            _id: '$serviceRequestStatus',
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
      ]),
      this.notificationModel.countDocuments({ userId, isRead: false }),
    ]);

    const srSummary = {
      total: 0,
      active: 0,
      activeIds: [] as Types.ObjectId[],
      completed: 0,
      completedIds: [] as Types.ObjectId[],
      issues: 0,
      issueIds: [] as Types.ObjectId[],
    };

    srStats.forEach((stat) => {
      srSummary.total += stat.count;
      switch (stat._id) {
        case ServiceRequestStatus.RECEIVED:
        case ServiceRequestStatus.ON_PROGRESS:
        case ServiceRequestStatus.PARTIAL_COMPLETED:
        case ServiceRequestStatus.APPROVED:
          srSummary.active += stat.count;
          srSummary.activeIds.push(...stat.ids);
          break;
        case ServiceRequestStatus.COMPLETED:
        case ServiceRequestStatus.CLOSED:
          srSummary.completed += stat.count;
          srSummary.completedIds.push(...stat.ids);
          break;
        case ServiceRequestStatus.REJECTED:
        case ServiceRequestStatus.UNPROCESSABLE:
        case ServiceRequestStatus.FAILED:
        case ServiceRequestStatus.CANCELLED:
          srSummary.issues += stat.count;
          srSummary.issueIds.push(...stat.ids);
          break;
      }
    });

    return {
      serviceRequests: srSummary,
      unreadNotifications,
    };
  }

  private async getStaffSummary(user: UserDocument) {
    const userCompanyId = user.companyId || (user as any).company?._id;
    const userId = new Types.ObjectId(user._id as unknown as string);
    const companyId = userCompanyId ? new Types.ObjectId(userCompanyId as unknown as string) : null;

    const matchQuery: any = { assignedStaff: { $in: [userId] } };
    if (companyId) matchQuery.companyId = companyId;

    const [woStats, unreadNotifications] = await Promise.all([
      this.workOrderModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
      ]),
      this.notificationModel.countDocuments({ userId, isRead: false }),
    ]);

    // We also want to find reports needing action for WOs assigned to this staff
    // Find all WOs assigned to this user
    const assignedWOs = await this.workOrderModel.find(matchQuery).select('_id').lean();
    const woIds = assignedWOs.map(wo => wo._id);

    const pendingReportsList = await this.workReportModel.find({
      workOrderId: { $in: woIds },
      status: { $in: [WorkReportStatus.DRAFTED, WorkReportStatus.REJECTED] }
    }).select('_id').lean();

    const woSummary = {
      total: 0,
      ongoing: 0,
      ongoingIds: [] as Types.ObjectId[],
      pendingAction: 0,
      pendingActionIds: [] as Types.ObjectId[],
      completed: 0,
      completedIds: [] as Types.ObjectId[],
    };

    woStats.forEach((stat) => {
      woSummary.total += stat.count;
      switch (stat._id) {
        case WorkOrderStatus.ON_PROGRESS:
          woSummary.ongoing += stat.count;
          woSummary.ongoingIds.push(...stat.ids);
          break;
        case WorkOrderStatus.DRAFTED:
        case WorkOrderStatus.SENT:
          woSummary.pendingAction += stat.count;
          woSummary.pendingActionIds.push(...stat.ids);
          break;
        case WorkOrderStatus.COMPLETED:
          woSummary.completed += stat.count;
          woSummary.completedIds.push(...stat.ids);
          break;
      }
    });

    return {
      role: Role.CompanyStaff,
      metrics: {
        workOrders: woSummary,
        workReports: {
          pendingAction: pendingReportsList.length,
          pendingActionIds: pendingReportsList.map(r => r._id),
        },
        unreadNotifications,
      },
    };
  }

  private async getManagerSummary(user: UserDocument) {
    const userCompanyId = user.companyId || (user as any).company?._id;
    if (!userCompanyId) throw new ForbiddenException('User is not associated with a company');
    const companyId = new Types.ObjectId(userCompanyId as unknown as string);

    const [incomingSRsList, woStats, pendingApprovalsList] = await Promise.all([
      this.serviceRequestModel.find({ companyId, serviceRequestStatus: ServiceRequestStatus.RECEIVED }).select('_id').lean(),
      this.workOrderModel.aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
      ]),
      this.workReportModel.find({ companyId, status: WorkReportStatus.SUBMITTED }).select('_id').lean(),
    ]);

    const woSummary = {
      total: 0,
      onProgress: 0,
      onProgressIds: [] as Types.ObjectId[],
      completed: 0,
      completedIds: [] as Types.ObjectId[],
      failed: 0,
      failedIds: [] as Types.ObjectId[],
    };

    woStats.forEach((stat) => {
      woSummary.total += stat.count;
      switch (stat._id) {
        case WorkOrderStatus.ON_PROGRESS:
          woSummary.onProgress += stat.count;
          woSummary.onProgressIds.push(...stat.ids);
          break;
        case WorkOrderStatus.COMPLETED:
          woSummary.completed += stat.count;
          woSummary.completedIds.push(...stat.ids);
          break;
        case WorkOrderStatus.FAILED:
          woSummary.failed += stat.count;
          woSummary.failedIds.push(...stat.ids);
          break;
      }
    });

    return {
      role: Role.CompanyManager,
      metrics: {
        incomingServiceRequests: incomingSRsList.length,
        incomingServiceRequestIds: incomingSRsList.map(sr => sr._id),
        workOrders: woSummary,
        pendingApprovals: pendingApprovalsList.length,
        pendingApprovalIds: pendingApprovalsList.map(r => r._id),
      },
    };
  }

  private async getOwnerSummary(user: UserDocument) {
    const userCompanyId = user.companyId || (user as any).company?._id;
    if (!userCompanyId) throw new ForbiddenException('User is not associated with a company');
    const companyId = new Types.ObjectId(userCompanyId as unknown as string);

    const [totalSRs, totalWOs, totalWRs, staffStats, completedWOs] = await Promise.all([
      this.serviceRequestModel.countDocuments({ companyId }),
      this.workOrderModel.countDocuments({ companyId }),
      this.workReportModel.countDocuments({ companyId }),
      this.userModel.aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
      this.workOrderModel.countDocuments({ companyId, status: WorkOrderStatus.COMPLETED })
    ]);

    const staffSummary = {
      total: 0,
      managers: 0,
      staff: 0,
    };

    staffStats.forEach((stat) => {
      staffSummary.total += stat.count;
      if (stat._id === Role.CompanyManager) {
        staffSummary.managers += stat.count;
      } else if (stat._id === Role.CompanyStaff || stat._id === Role.UnassignedStaff) {
        staffSummary.staff += stat.count;
      }
    });

    const completionRate = totalWOs > 0 ? (completedWOs / totalWOs) * 100 : 0;

    return {
      role: Role.CompanyOwner,
      metrics: {
        volume: {
          totalServiceRequests: totalSRs,
          totalWorkOrders: totalWOs,
          totalWorkReports: totalWRs,
        },
        staffing: staffSummary,
        completionRate: parseFloat(completionRate.toFixed(2)),
      },
    };
  }
}
