import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        });
    }

    /**
     * Validate JWT payload and return user object
     * This method is called automatically by Passport after JWT verification
     */
    async validate(payload: JwtPayload) {
        // Fetch fresh user data from database to ensure up-to-date info
        const user = await this.usersService.findById(payload.userId)
            .populate([
                { path: 'companyId', select: 'name address description' },
                { path: 'positionId', select: 'name description' },
            ])
            .exec();

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Transform user object for request attachment
        const userObject: any = user.toObject();

        // Rename populated fields for consistency
        if (userObject.companyId) {
            userObject.company = userObject.companyId;
            delete userObject.companyId;
        }
        if (userObject.positionId) {
            userObject.position = userObject.positionId;
            delete userObject.positionId;
        }

        // This object will be attached to request.user
        return userObject;
    }
}
