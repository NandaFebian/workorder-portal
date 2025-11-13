// src/common/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);