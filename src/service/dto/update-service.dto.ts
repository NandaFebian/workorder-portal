import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateServiceRequestConfigDto {
  @IsOptional()
  @ValidateIf((o, v) => v !== "" && v !== null)
  @IsMongoId()
  intakeFormId?: string;

  @ValidateIf((o) => o.reviewNeed === true && o.reviewFormId !== "" && o.reviewFormId !== null)
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

class UpdateWorkOrderConfigDto {
  @IsMongoId()
  @IsOptional()
  _id?: string;

  @IsMongoId()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  configId?: string;

  @IsOptional()
  @ValidateIf((o, v) => v !== "" && v !== null)
  @IsMongoId()
  workOrderFormId?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== "" && v !== null)
  @IsMongoId()
  workReportFormId?: string;

  @IsEnum(['auto', 'staff_pic'])
  @IsOptional()
  workOrderApprovalAccessType?: string;

  @IsEnum(['auto', 'manager'])
  @IsOptional()
  workReportApprovalAccessType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStaff?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxStaff?: number;

  @IsBoolean()
  @IsOptional()
  showReportToRequester?: boolean;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['public', 'member_only', 'internal'])
  @IsOptional()
  accessType?: string;

  @IsEnum(['auto', 'manual'])
  @IsOptional()
  draftingWorkOrderType?: string;

  @ValidateNested()
  @Type(() => UpdateServiceRequestConfigDto)
  @IsOptional()
  serviceRequestConfig?: UpdateServiceRequestConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkOrderConfigDto)
  @IsOptional()
  workOrdersConfig?: UpdateWorkOrderConfigDto[];
}
