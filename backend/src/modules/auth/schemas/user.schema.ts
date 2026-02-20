import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Phone number (used for OTP authentication)" })
  @Prop({ index: true })
  phone?: string;

  @ApiProperty({ description: "Email address" })
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @ApiProperty({ description: "Hashed password" })
  @Prop({ required: false, select: false }) // Password is not selected by default
  password?: string;

  @ApiProperty({ description: "Whether the account is verified" })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({
    description: "User role",
    enum: ["admin", "business", "user"],
  })
  @Prop({
    type: String,
    enum: ["admin", "business", "user"],
    default: "user",
  })
  role: string;

  @ApiProperty({ description: "User display name" })
  @Prop()
  name?: string;

  @ApiProperty({ description: "Device MAC address for compliance" })
  @Prop()
  macAddress?: string;

  @ApiProperty({ description: "Last login timestamp" })
  @Prop()
  lastLogin?: Date;

  @ApiProperty({ description: "OTP for verification" })
  @Prop()
  otp?: string;

  @ApiProperty({ description: "OTP expiration timestamp" })
  @Prop()
  otpExpiresAt?: Date;

  @ApiProperty({ description: "Number of OTP requests (for rate limiting)" })
  @Prop({ default: 0 })
  otpRequestCount: number;

  @ApiProperty({ description: "Last OTP request timestamp" })
  @Prop()
  lastOtpRequestAt?: Date;

  @ApiProperty({ description: "Pending email address (for email change OTP flow)" })
  @Prop()
  pendingEmail?: string;

  @ApiProperty({ description: "OTP for pending email verification" })
  @Prop()
  pendingEmailOtp?: string;

  @ApiProperty({ description: "Pending email OTP expiration" })
  @Prop()
  pendingEmailOtpExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for optimized queries (phone index already defined in @Prop)
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
