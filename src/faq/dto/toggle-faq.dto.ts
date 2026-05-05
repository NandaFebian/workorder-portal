// src/faq/dto/toggle-faq.dto.ts
import { IsBoolean } from 'class-validator';

export class ToggleFaqDto {
  @IsBoolean()
  isActive: boolean;
}
