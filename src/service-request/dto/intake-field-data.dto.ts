// src/service-requests/dto/intake-field-data.dto.ts
import { IsInt, IsNotEmpty, IsDefined } from 'class-validator';

export class IntakeFieldDataDto {
    @IsInt()
    @IsNotEmpty()
    order: number;

    @IsDefined() // Izinkan semua jenis value (null, "", 0, false)
    value: any;
}