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

        // Cari token di database
        const activeToken = await this.activeTokenModel.findOne({ token: token }).exec();
        if (!activeToken) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Cari user berdasarkan userId dari token
        const user = await this.usersService.findById(activeToken.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Sematkan user ke request agar bisa diakses di controller
        request['user'] = user;

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}