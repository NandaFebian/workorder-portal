// src/auth/guards/auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActiveToken, ActiveTokenDocument } from '../schemas/active-token.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectModel(ActiveToken.name) private activeTokenModel: Model<ActiveTokenDocument>,
        private usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        const activeToken = await this.activeTokenModel.findOne({ token }).exec();
        if (!activeToken) {
            throw new UnauthorizedException('Invalid or expired token');
        }
        const user = await this.usersService.findById(activeToken.userId).populate([
            { path: 'companyId', select: 'name address description' },
            { path: 'positionId', select: 'name description' },
        ]).exec();

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const userObject: any = user.toObject();

        if (userObject.companyId) {
            userObject.company = userObject.companyId;
            delete userObject.companyId;
        }
        if (userObject.positionId) {
            userObject.position = userObject.positionId;
            delete userObject.positionId;
        }
        request['user'] = userObject;

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}