import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'The FCM registration token from the client' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
