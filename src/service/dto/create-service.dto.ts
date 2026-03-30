import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class ServiceRequestConfigDto {
  @IsMongoId({ message: 'intakeFormId must be a valid MongoDB ObjectId' })
  @IsOptional()
  intakeFormId?: string;

  @ValidateIf((o) => o.reviewNeed === true || (o.reviewFormId !== null && o.reviewFormId !== undefined && o.reviewFormId !== ''))
  @IsNotEmpty({ message: 'reviewFormId is required when reviewNeed is true' })
  @IsMongoId({ message: 'reviewFormId must be a valid MongoDB ObjectId' })
  reviewFormId?: string | null;

  @IsEnum(['auto', 'manager'])
  @IsOptional()
  serviceRequestApprovalAccessType?: string;

  @IsBoolean()
  @IsOptional()
  reviewNeed?: boolean;
}

class WorkOrderConfigDto {
  @IsMongoId({ message: 'positionId must be a valid MongoDB ObjectId' })
  @IsNotEmpty()
  positionId: string;

  @IsMongoId({ message: 'workOrderFormId must be a valid MongoDB ObjectId' })
  @IsOptional()
  workOrderFormId?: string;

  @IsMongoId({ message: 'workReportFormId must be a valid MongoDB ObjectId' })
  @IsOptional()
  workReportFormId?: string;

  @IsEnum(['auto', 'staff_pic'])
  @IsOptional()
  workOrderApprovalAccessType?: string;

  @IsEnum(['auto', 'manager'])
  @IsOptional()
  workReportApprovalAccessType?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minStaff: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  maxStaff: number;
}

const allowedAccessTypes = ['public', 'member_only', 'internal'];

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;

  @IsEnum(allowedAccessTypes, {
    message: `accessType must be one of: ${allowedAccessTypes.join(', ')}`,
  })
  @IsNotEmpty()
  accessType: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateNested()
  @Type(() => ServiceRequestConfigDto)
  @IsOptional()
  serviceRequestConfig?: ServiceRequestConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderConfigDto)
  @ArrayMinSize(1, { message: 'At least one workOrdersConfig entry is required' })
  workOrdersConfig: WorkOrderConfigDto[];
}
