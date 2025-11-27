import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkReportDto } from './create-work-report.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateWorkReportDto extends PartialType(CreateWorkReportDto) {
    @IsDateString()
    @IsOptional()
    startedAt?: Date;

    @IsDateString()
    @IsOptional()
    completedAt?: Date;
}