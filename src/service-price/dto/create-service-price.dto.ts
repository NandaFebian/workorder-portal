import { IsNotEmpty, IsMongoId, IsInt, Min } from 'class-validator';

export class CreateServicePriceDto {
  @IsNotEmpty()
  @IsMongoId()
  serviceId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;
}
