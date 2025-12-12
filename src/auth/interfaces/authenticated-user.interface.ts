// src/auth/interfaces/authenticated-user.interface.ts
import { Types } from 'mongoose';

// Ini adalah bentuk 'company' dan 'position' setelah di-populate dan ditransformasi
interface PopulatedField {
    _id: Types.ObjectId;
    name: string;
    description?: string;
}

// Tipe ini merepresentasikan objek user yang ada di dalam request
export interface AuthenticatedUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
    company?: PopulatedField;
    position?: PopulatedField;
}