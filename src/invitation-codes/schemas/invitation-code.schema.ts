import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';

export type InvitationCodeDocument = InvitationCode & Document;

/**
 * A reusable, shareable invitation: instead of inviting one user by email, an
 * owner/manager configures a code that carries the role + position (department)
 * to grant. Any `staff_unassigned` user who claims it joins the company with
 * exactly that configuration.
 *
 * The role/position rules are the same as a regular email invitation.
 */
@Schema({ timestamps: true })
export class InvitationCode {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: MongooseSchema.Types.ObjectId;

  /** Role granted on claim. Same allowed set as a regular invitation. */
  @Prop({ required: true, enum: [Role.CompanyStaff, Role.CompanyManager] })
  role: string;

  /** Department/position granted on claim. Required when role is company_staff. */
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Position',
    default: null,
  })
  positionId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  /** Maximum number of claims. `null` means unlimited. */
  @Prop({ type: Number, default: null })
  maxUses: number | null;

  @Prop({ default: 0 })
  usedCount: number;

  /** `null` means the code never expires. */
  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  claimedBy: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date;
}

export const InvitationCodeSchema =
  SchemaFactory.createForClass(InvitationCode);

InvitationCodeSchema.index({ companyId: 1, deletedAt: 1 });
InvitationCodeSchema.index({ code: 1, deletedAt: 1 });
