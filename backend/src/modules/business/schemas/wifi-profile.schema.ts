import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

// ---- Ad Sub-document Schema ----

@Schema({ _id: false })
export class Ad {
  @ApiProperty({ description: "Unique ad identifier" })
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  id: Types.ObjectId;

  @ApiProperty({ description: "Media URL (image/video)" })
  @Prop({ required: true })
  mediaUrl: string;

  @ApiProperty({ description: "Media type", enum: ["image", "video"] })
  @Prop({ type: String, enum: ["image", "video"], required: true })
  mediaType: string;

  @ApiProperty({ description: "Call-to-action URL (Google Review Link)" })
  @Prop()
  ctaUrl?: string;

  @ApiProperty({ description: "Ad title" })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: "Ad description" })
  @Prop()
  description?: string;

  @ApiProperty({ description: "Display duration in seconds" })
  @Prop({ default: 5 })
  duration: number;

  @ApiProperty({
    description: "Ad status",
    enum: ["active", "paused", "archived"],
  })
  @Prop({
    type: String,
    enum: ["active", "paused", "archived"],
    default: "active",
  })
  status: string;

  @ApiProperty({ description: "Total views" })
  @Prop({ default: 0 })
  views: number;

  @ApiProperty({ description: "Total clicks" })
  @Prop({ default: 0 })
  clicks: number;

  @ApiProperty({ description: "Total likes" })
  @Prop({ default: 0 })
  likesCount: number;

  @ApiProperty({ description: "Total shares" })
  @Prop({ default: 0 })
  sharesCount: number;

  @ApiProperty({ description: "Total gallery expands/taps" })
  @Prop({ default: 0 })
  expandsCount: number;

  @ApiProperty({ description: "Created timestamp" })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    description: "Ad placement type",
    enum: ["BANNER", "GALLERY"],
  })
  @Prop({
    type: String,
    enum: ["BANNER", "GALLERY"],
    required: true,
    default: "GALLERY",
  })
  placement: string;

  @ApiProperty({ description: "Ad source", enum: ["INTERNAL", "THIRD_PARTY"] })
  @Prop({
    type: String,
    enum: ["INTERNAL", "THIRD_PARTY"],
    default: "INTERNAL",
  })
  source: string;

  @ApiProperty({ description: "S3 Key for file management" })
  @Prop()
  s3Key?: string;
}

export const AdSchema = SchemaFactory.createForClass(Ad);

// ---- Main WifiProfile Schema ----

export type WifiProfileDocument = WifiProfile & Document;

@Schema({ timestamps: true, collection: "wifi_profiles" })
export class WifiProfile {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Reference to businesses collection" })
  @Prop({
    type: Types.ObjectId,
    ref: "Business",
    required: true,
    unique: true,
    index: true,
  })
  businessId: Types.ObjectId;

  @ApiProperty({ description: "Logo URL for WiFi portal page" })
  @Prop()
  logoUrl?: string;

  @ApiProperty({ description: "S3 Key for WiFi portal logo" })
  @Prop()
  logoS3Key?: string;

  @ApiProperty({ description: "WiFi SSID" })
  @Prop()
  wifiSsid?: string;

  @ApiProperty({ description: "Google Review URL for CTA" })
  @Prop()
  googleReviewUrl?: string;

  @ApiProperty({ description: "Welcome banner title" })
  @Prop()
  welcomeTitle?: string;

  @ApiProperty({ description: "CTA Button text on splash screen" })
  @Prop({ default: "View Offers" })
  ctaButtonText?: string;

  @ApiProperty({ description: "CTA Button URL on splash screen" })
  @Prop()
  ctaButtonUrl?: string;

  @ApiProperty({
    description: "Whether to show the welcome banner on splash screen",
  })
  @Prop({ default: true })
  showWelcomeBanner?: boolean;

  @ApiProperty({ description: "Operating hours as JSON" })
  @Prop({ type: Object })
  operatingHours?: Record<string, string>;

  @ApiProperty({ description: "Nested ads array", type: [Ad] })
  @Prop({ type: [AdSchema], default: [] })
  ads: Ad[];

  @ApiProperty({ description: "Created timestamp" })
  createdAt?: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt?: Date;
}

export const WifiProfileSchema = SchemaFactory.createForClass(WifiProfile);
