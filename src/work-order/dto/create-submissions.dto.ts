import {
  IsArray,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  IsDefined,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class FieldDataDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  order: number;

  @IsDefined()
  value: any;
}

export class CreateSubmissionsDto {
  @IsMongoId()
  @IsNotEmpty()
  formId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDataDto)
  fieldsData: FieldDataDto[];
}
