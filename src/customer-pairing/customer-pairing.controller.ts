import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerPairingService } from './customer-pairing.service';
import { StartPairingDto } from './dto/start-pairing.dto';
import { CompletePairingDto } from './dto/complete-pairing.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('customer-pairing')
@UseGuards(AuthGuard)
export class CustomerPairingController {
  constructor(private readonly customerPairingService: CustomerPairingService) {}

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(Role.Client)
  @HttpCode(HttpStatus.OK)
  async startPairing(
    @Body() dto: StartPairingDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.startPairing(dto, user);
    return ResponseUtil.success('Pairing initiated', data);
  }

  @Post('complete')
  @UseGuards(RolesGuard)
  @Roles(Role.Client)
  @HttpCode(HttpStatus.OK)
  async completePairing(
    @Body() dto: CompletePairingDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.completePairing(dto, user);
    return ResponseUtil.success('Account paired successfully', data);
  }

  @Get('companies/:id/external-accounts')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async findAllByCompany(
    @Param('id') companyId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.findAllByCompany(companyId, user);
    return ResponseUtil.success('External accounts retrieved successfully', data);
  }

  @Delete('external-accounts/:id')
  @HttpCode(HttpStatus.OK)
  async unpair(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.unpair(id, user);
    return ResponseUtil.success('External account unpaired successfully', data);
  }

  @Get('companies/:id/memberships')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async checkMemberships(
    @Param('id') companyId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.checkExternalMemberships(companyId, user);
    return ResponseUtil.success('Memberships retrieved successfully', data);
  }
}
