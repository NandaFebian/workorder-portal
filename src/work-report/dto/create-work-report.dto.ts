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

  @IsEnum(['drafted', 'in_progress', 'completed', 'cancelled', 'rejected'])
  @IsOptional()
  status?: string;
}
