import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MembershipCode,
  MembershipCodeDocument,
} from './schemas/membership.schema';
import { GenerateMemberCodesDto } from './dto/generate-code.dto';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import * as crypto from 'crypto';

@Injectable()
export class MembershipService {
  constructor(
    @InjectModel(MembershipCode.name)
    private membershipCodeModel: Model<MembershipCodeDocument>,
  ) {}

  async generateCodes(
    dto: GenerateMemberCodesDto,
    user: AuthenticatedUser,
  ): Promise<MembershipCodeDocument[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const codes: any[] = [];
    const prefix = dto.prefix ? dto.prefix.toUpperCase() : 'MEM';

    for (let i = 0; i < dto.amount; i++) {
      // Secure unique code generation: PREFIX-8HEXCHARS
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      const uniqueCode = `${prefix}-${randomPart}`;

      codes.push({
        code: uniqueCode,
        isClaimed: false,
        companyId: user.company._id,
      });
    }

    // Insert many (skipping duplicates if any, though unlikely with random)
    try {
      return (await this.membershipCodeModel.insertMany(codes)) as any;
    } catch (error) {
      throw new BadRequestException(
        'Failed to generate codes. Possible duplicate detected.',
      );
    }
  }

  async findAll(user: AuthenticatedUser): Promise<MembershipCodeDocument[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    return this.membershipCodeModel
      .find({ companyId: user.company._id, deletedAt: null })
      .populate('claimedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllSubscribedClients(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    
    // Find all claimed codes for this company, populate the client data
    const memberships = await this.membershipCodeModel
      .find({
        companyId: user.company._id,
        isClaimed: true,
        deletedAt: null,
      })
      .populate('claimedBy', 'name email role')
      .sort({ claimedAt: -1 })
      .exec();
      
    // Extract and format the clients
    return memberships.map((membership) => ({
      membershipCode: membership.code,
      claimedAt: membership.claimedAt,
      client: membership.claimedBy,
    }));
  }

  async claimCode(
    dto: ClaimMemberCodeDto,
    user: AuthenticatedUser,
  ): Promise<MembershipCodeDocument> {
    const codeDoc = await this.membershipCodeModel.findOne({
      code: dto.code,
      deletedAt: null,
    });

    if (!codeDoc) {
      throw new NotFoundException('Invalid membership code');
    }

    if (codeDoc.isClaimed) {
      throw new ConflictException('Membership code already claimed');
    }

    codeDoc.isClaimed = true;
    codeDoc.claimedBy = user._id as any;
    codeDoc.claimedAt = new Date();

    return codeDoc.save() as any;
  }

  async remove(id: string): Promise<{ deletedAt: Date }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid membership code ID');
    }

    const code = await this.membershipCodeModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!code) {
      throw new NotFoundException('Membership code not found');
    }

    // Soft delete
    const deletedAt = new Date();
    code.deletedAt = deletedAt;
    await code.save();

    return { deletedAt };
  }
}
