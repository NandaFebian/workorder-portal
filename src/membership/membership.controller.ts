import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MembershipService } from './membership.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';
import { MembershipResource } from './resources/membership.resource';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async getSubscribedClients(@GetUser() user: AuthenticatedUser) {
    const data = await this.membershipService.findAllSubscribedClients(user);
    return ResponseUtil.success('Subscribed clients loaded successfully', data);
  }
}

@Controller('memberships/codes')
@UseGuards(AuthGuard)
export class MembershipCodeController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const data = await this.membershipService.findAll(user);
    const transformed = MembershipResource.transformMembershipCodeList(data);
    return ResponseUtil.success('Membership codes loaded successfully', transformed);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.membershipService.importFromCsv(file, user);
    const transformed = MembershipResource.transformMembershipCodeList(data);
    return ResponseUtil.success('Codes imported successfully', transformed);
  }

  @Post('claim')
  async claimCode(
    @Body() dto: ClaimMemberCodeDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.membershipService.claimCode(dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async remove(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.membershipService.remove(id, user);
    return ResponseUtil.success('Membership code deleted successfully', data);
  }
}
