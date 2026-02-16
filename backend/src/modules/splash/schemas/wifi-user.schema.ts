import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type WifiUserDocument = WifiUser & Document;

@Schema({ timestamps: true, collection: "wifi_users" })
export class WifiUser {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Business ID this WiFi user connected to" })
  @Prop({ type: Types.ObjectId, ref: "Business", required: true, index: true })
  businessId: Types.ObjectId;

  @ApiProperty({ description: "User email address" })
  @Prop({ required: true, index: true })
  email: string;

  // ===== Google OAuth Fields =====
  @ApiProperty({ description: "Google OAuth user ID" })
  @Prop({ sparse: true })
  googleId?: string;

  @ApiProperty({ description: "Full name from Google profile" })
  @Prop()
  fullName?: string;

  @ApiProperty({ description: "First name from Google profile" })
  @Prop()
  firstName?: string;

  @ApiProperty({ description: "Last name from Google profile" })
  @Prop()
  lastName?: string;

  @ApiProperty({ description: "Profile picture URL from Google" })
  @Prop()
  profilePictureUrl?: string;

  @ApiProperty({
    description: "Authentication method used",
    enum: ["google", "email", "phone"],
  })
  @Prop({ default: "email" })
  authMethod: string;

  @ApiProperty({ description: "Whether email is verified by Google" })
  @Prop({ default: false })
  emailVerifiedByGoogle: boolean;

  @ApiProperty({ description: "Google locale" })
  @Prop()
  locale?: string;

  // ===== Legacy Email OTP Fields =====
  @ApiProperty({ description: "Hashed OTP code" })
  @Prop({ select: false })
  otpCode?: string;

  @ApiProperty({ description: "OTP expiry timestamp" })
  @Prop()
  otpExpiry?: Date;

  @ApiProperty({ description: "Number of OTP requests in current window" })
  @Prop({ default: 0 })
  otpRequestCount: number;

  @ApiProperty({ description: "Start of current OTP rate limit window" })
  @Prop()
  otpWindowStart?: Date;

  // ===== Verification & Session Fields =====
  @ApiProperty({
    description: "Whether user has verified their email/identity",
  })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: "Timestamp when user was verified" })
  @Prop()
  verifiedAt?: Date;

  @ApiProperty({ description: "IP address of the user" })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: "User agent / device info" })
  @Prop()
  deviceInfo?: string;

  // ===== Tracking & Analytics Fields =====
  @ApiProperty({ description: "Total number of visits/connections" })
  @Prop({ default: 1 })
  visitCount: number;

  @ApiProperty({ description: "Last visit timestamp" })
  @Prop()
  lastVisitAt?: Date;

  @ApiProperty({ description: "First login timestamp" })
  @Prop()
  firstLoginAt?: Date;

  @ApiProperty({
    description: "Signup source",
    enum: ["wifi_splash", "web", "app"],
  })
  @Prop({ default: "wifi_splash" })
  signupSource: string;

  @ApiProperty({ description: "Created timestamp" })
  createdAt?: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt?: Date;
}

export const WifiUserSchema = SchemaFactory.createForClass(WifiUser);

// Compound index for unique email per business
WifiUserSchema.index({ businessId: 1, email: 1 }, { unique: true });
WifiUserSchema.index({ email: 1 });
WifiUserSchema.index({ isVerified: 1 });
WifiUserSchema.index({ googleId: 1 }, { sparse: true });
WifiUserSchema.index({ authMethod: 1 });
