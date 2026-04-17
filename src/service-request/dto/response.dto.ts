import { Types } from 'mongoose';

export class ServiceSummaryDto {
  _id: string; // ObjectID
  title: string;
  description: string;
  accessType: 'public' | 'member_only' | 'internal';
  isActive: boolean;
}

export class ProviderServiceRequestResponseDto {
  _id: string; // ObjectID
  serviceRequestStatus: 'received' | 'cancelled' | 'rejected' | 'approved' | 'work_order_created' | 'unprocessable' | 'on_progress' | 'partial_completed' | 'failed' | 'completed' | 'closed';
  serviceRequestApprovalAccessType: 'auto' | 'manager';
  reviewNeed: boolean;
  service: ServiceSummaryDto;
  requestedBy: any; // USEROBJECT
  approvedBy: any; // USEROBJECT
  intakeForm: any; // FORMOBJECT
  reviewForm: any; // FORMOBJECT
  intakeSubmission: any; // SUBMISSIONOBJECT
  reviewSubmission: any; // SUBMISSIONOBJECT
  // ...semuaTanggalStatus
  receivedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  workOrderCreatedAt: Date | null;
  completedAt: Date | null;
  closedAt: Date | null;
}

export class RequesterServiceRequestResponseDto {
  _id: string; // ObjectID
  serviceRequestStatus: 'received' | 'cancelled' | 'rejected' | 'approved' | 'work_order_created' | 'unprocessable' | 'on_progress' | 'partial_completed' | 'failed' | 'completed' | 'closed';
  company: any; // COMPANYOBJECT
  service: ServiceSummaryDto;
  requestedBy: any; // USEROBJECT
  approvedBy: any; // USEROBJECT
  intakeForm: any; // FORMOBJECT
  reviewForm: any; // FORMOBJECT
  intakeSubmission: any; // SUBMISSIONOBJECT
  reviewSubmission: any; // SUBMISSIONOBJECT
  // ...semuaTanggalStatus
  receivedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  workOrderCreatedAt: Date | null;
  completedAt: Date | null;
  closedAt: Date | null;
}
