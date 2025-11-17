// src/service-requests/dto/update-request-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestStatus } from '../schemas/client-service-request.schema';

const allowedStatuses = [
    RequestStatus.UNDER_REVIEW,
    RequestStatus.REJECTED,
    RequestStatus.APPROVED,
];

export class UpdateRequestStatusDto {
    @IsEnum(allowedStatuses, {
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
    })
    @IsNotEmpty()
    status: string;
}