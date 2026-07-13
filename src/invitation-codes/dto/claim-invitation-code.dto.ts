import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimInvitationCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Code should not be empty' })
  code: string;
}
