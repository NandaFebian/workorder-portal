import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipCode, MembershipCodeDocument } from './schemas/membership.schema';
import { GenerateMemberCodesDto } from './dto/generate-code.dto';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MembershipService {
    constructor(
        @InjectModel(MembershipCode.name) private membershipCodeModel: Model<MembershipCodeDocument>,
    ) { }

    async generateCodes(dto: GenerateMemberCodesDto): Promise<MembershipCodeDocument[]> {
        const codes: any[] = [];
        const prefix = dto.prefix ? dto.prefix.toUpperCase() : 'MEM';

        for (let i = 0; i < dto.amount; i++) {
            // Simple unique code generation: PREFIX-RANDOM-TIMESTAMP_PART
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const uniqueCode = `${prefix}-${randomPart}`;

            codes.push({
                code: uniqueCode,
                isClaimed: false,
            });
        }

        // Insert many (skipping duplicates if any, though unlikely with random)
        try {
            return await this.membershipCodeModel.insertMany(codes) as any;
        } catch (error) {
            throw new BadRequestException('Failed to generate codes. Possible duplicate detected.');
        }
    }

    async findAll(): Promise<MembershipCodeDocument[]> {
        return this.membershipCodeModel.find().populate('claimedBy', 'name email').sort({ createdAt: -1 }).exec();
    }

    async claimCode(dto: ClaimMemberCodeDto, user: AuthenticatedUser): Promise<MembershipCodeDocument> {
        const codeDoc = await this.membershipCodeModel.findOne({ code: dto.code });

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
}
