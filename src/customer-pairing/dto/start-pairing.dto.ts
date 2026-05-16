import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class StartPairingDto {
  @IsMongoId()
  company_id: string;
}
