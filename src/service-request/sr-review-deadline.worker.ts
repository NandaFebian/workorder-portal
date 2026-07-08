import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from './schemas/service-request.schema';
import { ServiceRequestStatus } from '../common/enums/service-request-status.enum';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
@Processor('sr-review-deadline')
export class SrReviewDeadlineWorker extends WorkerHost {
  private readonly logger = new Logger(SrReviewDeadlineWorker.name);

  constructor(
    @InjectModel(ServiceRequest.name)
    private readonly srModel: Model<ServiceRequestDocument>,
    private readonly fcmService: FcmService,
  ) {
    super();
  }

  async process(job: Job<{ serviceRequestId: string }>): Promise<void> {
    const { serviceRequestId } = job.data;

    const sr = await this.srModel
      .findOne({
        _id: serviceRequestId,
        serviceRequestStatus: ServiceRequestStatus.COMPLETED,
        reviewNeed: true,
        deletedAt: null,
      })
      .exec();

    if (!sr) {
      this.logger.debug(
        `SR ${serviceRequestId} no longer eligible for auto-close, skipping.`,
      );
      return;
    }

    const now = new Date();
    sr.serviceRequestStatus = ServiceRequestStatus.CLOSED;
    sr.closedAt = now;
    sr.completedAt = sr.completedAt ?? now;
    await sr.save();

    this.logger.log(`Auto-closed SR ${sr.code} (${serviceRequestId})`);

    if (sr.requestedBy) {
      const requesterId = sr.requestedBy._id
        ? sr.requestedBy._id.toString()
        : sr.requestedBy.toString();
      await this.fcmService.sendToUser(
        requesterId,
        'Permintaan Layanan Ditutup Otomatis',
        `Permintaan layanan Anda (${sr.code}) telah ditutup otomatis karena melewati batas waktu review (7 hari).`,
        {
          resource: 'service_request',
          resourceId: serviceRequestId,
          status: ServiceRequestStatus.CLOSED,
        },
      );
    }
  }
}
