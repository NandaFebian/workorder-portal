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
  @IsMongoId()
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

class UpdateWorkOrderConfigDto {
  @IsMongoId()
  @IsOptional()
  positionId?: string;

  @IsMongoId()
  @IsOptional()
  workOrderFormId?: string;

  @IsMongoId()
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
  @IsOptional()
  minStaff?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxStaff?: number;
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
