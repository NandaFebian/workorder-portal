// src/service/types/service-form.types.ts
import { Types } from 'mongoose';

// Tipe untuk DTO input (menerima formId dengan akses kontrol)
export type OrderedFormInputDto = {
    order: number;
    formId: string;
    fillableByRoles?: string[];
    viewableByRoles?: string[];
    fillableByPositionIds?: string[];
    viewableByPositionIds?: string[];
};

// Tipe DTO input khusus untuk Client Intake Form (tanpa akses kontrol)
export type ClientIntakeFormInputDto = {
    order: number;
    formId: string;
}

// Tipe Union untuk helper
export type AnyOrderedFormInputDto = OrderedFormInputDto | ClientIntakeFormInputDto;


// Interface untuk struktur data form yang disimpan di DB (menggunakan formKey)
export interface IOrderedForm {
    order: number;
    formKey: string;
    fillableByRoles: string[];
    viewableByRoles: string[];
    fillableByPositionIds: Types.ObjectId[];
    viewableByPositionIds: Types.ObjectId[];
}