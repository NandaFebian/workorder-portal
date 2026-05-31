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
  constructor(
    private readonly customerPairingService: CustomerPairingService,
  ) {}

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

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Client)
  @HttpCode(HttpStatus.OK)
  async findAllPairedAccounts(@GetUser() user: AuthenticatedUser) {
    const data = await this.customerPairingService.findAllForUser(user);
    return ResponseUtil.success('Paired accounts retrieved successfully', data);
  }

  @Get('company/:companyId')
  @UseGuards(RolesGuard)
  @Roles(Role.Client)
  @HttpCode(HttpStatus.OK)
  async findPairedInCompany(
    @Param('companyId') companyId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.findForUserInCompany(
      companyId,
      user,
    );
    return ResponseUtil.success('Paired account retrieved successfully', data);
  }

  @Delete(':external_account_id')
  @UseGuards(RolesGuard)
  @Roles(Role.Client)
  @HttpCode(HttpStatus.OK)
  async unpair(
    @Param('external_account_id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.customerPairingService.unpair(id, user);
    return ResponseUtil.success('External account unpaired successfully', data);
  }
}
