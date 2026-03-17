import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export class CreateWorkReportDto {
  @IsMongoId()
  @IsNotEmpty()
  workOrderId: string;

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @IsArray()
  @IsOptional()
  reportForms?: any[];

  @IsEnum(['in_progress', 'completed', 'cancelled', 'rejected'])
  @IsOptional()
  status?: string;
}
