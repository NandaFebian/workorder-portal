import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('public/service-request')
@UseGuards(AuthGuard) // Client harus login
export class ServiceRequestPublicController {
  constructor(private readonly csrService: ServiceRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findAllByClientId(user._id.toString());
    return { success: true, message: 'Load data success', data };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.csrService.findOneForClient(
      id,
      user._id.toString(),
    );
    return { success: true, message: 'Load data success', data };
  }
}
