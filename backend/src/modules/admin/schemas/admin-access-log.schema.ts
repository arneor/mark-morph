import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type AdminAccessLogDocument = AdminAccessLog & Document;

@Schema({ timestamps: true, collection: "admin_access_logs" })
export class AdminAccessLog {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Admin ID who performed the action" })
  @Prop({ type: Types.ObjectId, ref: "Admin", required: true, index: true })
  adminId: Types.ObjectId;

  @ApiProperty({ description: "Admin email for quick reference" })
  @Prop({ required: true })
  adminEmail: string;

  @ApiProperty({ description: "Business ID that was accessed (if applicable)" })
  @Prop({ type: Types.ObjectId, ref: "Business", index: true })
  businessId?: Types.ObjectId;

  @ApiProperty({
    description: "Action performed",
    enum: [
      "login",
      "view_business",
      "update_business",
      "activate_business",
      "reject_business",
      "suspend_business",
      "view_dashboard",
      "view_analytics",
    ],
  })
  @Prop({ required: true })
  action: string;

  @ApiProperty({ description: "Additional details about the action" })
  @Prop({ type: Object })
  details?: Record<string, any>;

  @ApiProperty({ description: "IP address of the request" })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: "User agent of the request" })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: "Timestamp of the action" })
  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const AdminAccessLogSchema =
  SchemaFactory.createForClass(AdminAccessLog);

// Compound index for querying by business and time
AdminAccessLogSchema.index({ businessId: 1, timestamp: -1 });
AdminAccessLogSchema.index({ adminId: 1, timestamp: -1 });
