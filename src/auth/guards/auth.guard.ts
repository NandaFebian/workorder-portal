// src/auth/guards/auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Extends Passport's JWT strategy guard
 * 
 * This guard:
 * 1. Extracts JWT from Authorization header (Bearer <token>)
 * 2. Verifies JWT signature and expiration
 * 3. Calls JwtStrategy.validate() to get user
 * 4. Attaches user to request.user
 */
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
    // Passport handles all the validation automatically
    // No need for custom logic - JwtStrategy does the work
}
