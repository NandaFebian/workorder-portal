import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CompletePairingDto {
  @IsMongoId()
  company_id: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
