import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type BusinessDocument = Business & Document;

@Schema({ timestamps: true, collection: "businesses" })
export class Business {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Business name" })
  @Prop({ required: true })
  businessName: string;

  @ApiProperty({ description: "Owner user ID", type: String })
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: "Public username for custom link" })
  @Prop({ unique: true, index: true, sparse: true })
  username?: string;

  @ApiProperty({ description: "Business location/address" })
  @Prop()
  location?: string;

  @ApiProperty({ description: "Business category" })
  @Prop()
  category?: string;

  @ApiProperty({ description: "Business description" })
  @Prop()
  description?: string;

  @ApiProperty({ description: "Industry type / category" })
  @Prop()
  industryType?: string;

  @ApiProperty({ description: "Contact email" })
  @Prop()
  contactEmail?: string;

  @ApiProperty({ description: "Contact phone" })
  @Prop()
  contactPhone?: string;

  @ApiProperty({ description: "Logo URL" })
  @Prop()
  logoUrl?: string;

  @ApiProperty({ description: "S3 Key for logo" })
  @Prop()
  logoS3Key?: string;

  @ApiProperty({ description: "Primary brand color" })
  @Prop({ default: "#000000" })
  primaryColor: string;

  @ApiProperty({ description: "Profile type", enum: ["private", "public"] })
  @Prop({ type: String, enum: ["private", "public"], default: "private" })
  profileType: string;

  @ApiProperty({ description: "Whether onboarding is completed" })
  @Prop({ default: false })
  onboardingCompleted: boolean;

  @ApiProperty({ description: "Whether business is active" })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: "Business approval status",
    enum: ["pending_approval", "active", "suspended", "rejected"],
  })
  @Prop({
    type: String,
    enum: ["pending_approval", "active", "suspended", "rejected"],
    default: "pending_approval",
  })
  status: string;

  @ApiProperty({ description: "Admin ID who activated the business" })
  @Prop({ type: Types.ObjectId, ref: "Admin" })
  activatedBy?: Types.ObjectId;

  @ApiProperty({ description: "Timestamp when business was activated" })
  @Prop()
  activatedAt?: Date;

  @ApiProperty({ description: "Reason for rejection (if rejected)" })
  @Prop()
  rejectionReason?: string;

  @ApiProperty({ description: "Reason for suspension (if suspended)" })
  @Prop()
  suspensionReason?: string;

  @ApiProperty({ description: "History of status changes" })
  @Prop({
    type: [
      {
        status: String,
        changedBy: Types.ObjectId,
        changedAt: Date,
        reason: String,
      },
    ],
    default: [],
  })
  statusHistory: Array<{
    status: string;
    changedBy?: Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }>;

  @ApiProperty({ description: "Created timestamp" })
  createdAt?: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt?: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);

// Indexes for optimized queries
BusinessSchema.index({ businessName: "text" });
BusinessSchema.index({ category: 1 });
BusinessSchema.index({ isActive: 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ industryType: 1 });
