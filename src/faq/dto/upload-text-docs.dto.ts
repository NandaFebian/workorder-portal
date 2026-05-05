// src/faq/dto/upload-text-docs.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadTextDocsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
