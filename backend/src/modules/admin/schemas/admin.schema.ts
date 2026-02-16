import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: "super_admin" })
  role: string;

  @Prop()
  name?: string;

  // OTP fields (replaces password)
  @Prop({ select: false })
  otpCode?: string; // Hashed OTP

  @Prop()
  otpExpiry?: Date;

  @Prop({ default: 0 })
  otpRequestCount: number; // For rate limiting

  @Prop()
  otpRequestResetAt?: Date; // Reset time for rate limit

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Indexes
AdminSchema.index({ email: 1 }, { unique: true });
