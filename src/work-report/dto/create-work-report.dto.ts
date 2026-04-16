import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateWorkReportDto {
  @IsMongoId()
  @IsNotEmpty()
  workOrderId: string;

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @IsMongoId()
  @IsOptional()
  reportFormId?: string;

  @IsEnum(['drafted', 'onProgress', 'submitted', 'approved', 'rejected'])
  @IsOptional()
  status?: string;

  @IsEnum(['auto', 'manager'])
  @IsOptional()
  workReportApprovalAccessType?: string;
}
