import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class StartPairingDto {
  @IsString()
  @IsNotEmpty()
  redirect_base_url: string;

  @IsMongoId()
  company_id: string;
}
