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

  @IsString()
  @IsOptional()
  reportFormKey?: string;

  @IsEnum(['drafted', 'in_progress', 'completed', 'cancelled', 'rejected'])
  @IsOptional()
  status?: string;
}
