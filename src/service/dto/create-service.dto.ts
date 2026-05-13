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
  @IsNotEmpty({ message: 'intakeFormId is required' })
  intakeFormId?: string;

  @ValidateIf((o) => o.reviewNeed === true)
  @IsNotEmpty({ message: 'reviewFormId is required when reviewNeed is true' })
  @IsMongoId({ message: 'reviewFormId must be a valid MongoDB ObjectId' })
  reviewFormId?: string | null;

  @IsEnum(['auto', 'manager', 'staff_pic', 'staff_any'])
  @IsOptional()
  serviceRequestApprovalAccessType?: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'reviewNeed is required' })
  reviewNeed?: boolean;
}

class WorkOrderConfigDto {
  @IsMongoId()
  @IsOptional()
  _id?: string;

  @IsMongoId({ message: 'positionId must be a valid MongoDB ObjectId' })
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsOptional()
  configId?: string;

  @IsMongoId({ message: 'workOrderFormId must be a valid MongoDB ObjectId' })
  @IsOptional()
  workOrderFormId?: string | null;

  @IsMongoId({ message: 'workReportFormId must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'workReportFormId is required' })
  workReportFormId?: string;

  @IsEnum(['auto', 'staff_pic', 'staff_any'])
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

  @IsBoolean()
  @IsOptional()
  showReportToRequester?: boolean;
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

  @IsEnum(['auto', 'manual'], {
    message: 'draftingWorkOrderType must be either auto or manual',
  })
  @IsNotEmpty({ message: 'draftingWorkOrderType is required' })
  draftingWorkOrderType: string;

  @ValidateNested()
  @Type(() => ServiceRequestConfigDto)
  @IsNotEmpty({ message: 'serviceRequestConfig is required' })
  serviceRequestConfig?: ServiceRequestConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderConfigDto)
  @ArrayMinSize(1, { message: 'At least one workOrdersConfig entry is required' })
  workOrdersConfig: WorkOrderConfigDto[];
}
