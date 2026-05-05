// src/faq/dto/ask-faq.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class AskFaqDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}
