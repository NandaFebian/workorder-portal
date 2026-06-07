import { IsEmail, IsNotEmpty } from 'class-validator';

export class KickEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
