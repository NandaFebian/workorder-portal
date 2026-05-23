import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateServicePriceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
