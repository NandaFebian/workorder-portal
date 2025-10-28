// src/service/types/service-form.types.ts
import { Types } from 'mongoose'; // Pastikan Types diimpor dari mongoose

export type OrderedFormInputDto = {
    order: number;
    formId: string;
    fillableByRoles?: string[];
    viewableByRoles?: string[];
    fillableByPositionIds?: string[];
    viewableByPositionIds?: string[];
};

// Tipe DTO input khusus untuk Client Intake Form
export type ClientIntakeFormInputDto = {
    order: number;
    formId: string;
}

// Tipe Union untuk helper
export type AnyOrderedFormInputDto = OrderedFormInputDto | ClientIntakeFormInputDto;


// Interface untuk struktur data form yang disimpan di DB
export interface IOrderedForm {
    order: number;
    formKey: string;
    fillableByRoles: string[];
    viewableByRoles: string[];
    fillableByPositionIds: Types.ObjectId[]; // Gunakan Types.ObjectId
    viewableByPositionIds: Types.ObjectId[]; // Gunakan Types.ObjectId
}