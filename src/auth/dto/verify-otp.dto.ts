import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP should not be empty' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
