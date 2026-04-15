import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class AssignStaffDto {
  @IsOptional()
  @IsEmail()
  @IsString()
  staff_pic?: string;

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  assign_staffs?: string[];
}
