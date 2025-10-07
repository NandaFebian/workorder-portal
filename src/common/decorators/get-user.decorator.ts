// src/common/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface'; // <-- 1. Impor tipe baru

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthenticatedUser => { // <-- 2. Gunakan tipe baru
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);