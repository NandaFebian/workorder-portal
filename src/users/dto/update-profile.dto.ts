import {
  IsString,
  IsOptional,
  MinLength,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Required if newPassword is provided.
   * Used to verify the user's identity before changing password.
   */
  @IsOptional()
  @IsString()
  currentPassword?: string;

  /**
   * The new password to set. Requires currentPassword.
   */
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
