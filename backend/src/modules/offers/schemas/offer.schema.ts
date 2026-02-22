import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type OfferDocument = Offer & Document;

// GeoJSON Point sub-document
@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ["Point"], default: "Point" })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[]; // [longitude, latitude]
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

// Offer Categories
export const OFFER_CATEGORIES = [
  "mobile",
  "laptops",
  "tv",
  "fridge",
  "electronics",
  "clothing",
  "food",
  "furniture",
  "health",
  "beauty",
  "sports",
  "books",
  "toys",
  "automotive",
  "services",
  "other",
] as const;

export type OfferCategory = (typeof OFFER_CATEGORIES)[number];

@Schema({ timestamps: true, collection: "offers" })
export class Offer {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "Business that owns this offer" })
  @Prop({ type: Types.ObjectId, ref: "Business", required: true, index: true })
  businessId: Types.ObjectId;

  @ApiProperty({ description: "Business name (denormalized for public display)" })
  @Prop({ required: true })
  businessName: string;

  @ApiProperty({ description: "Business username (denormalized for profile link)" })
  @Prop()
  businessUsername?: string;

  @ApiProperty({ description: "Offer title" })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: "Detailed offer description" })
  @Prop()
  description?: string;

  @ApiProperty({ description: "Banner image URL" })
  @Prop()
  bannerUrl?: string;

  @ApiProperty({ description: "S3 key for banner image" })
  @Prop()
  bannerS3Key?: string;

  @ApiProperty({ description: "Product category" })
  @Prop({
    type: String,
    enum: OFFER_CATEGORIES,
    required: true,
    index: true,
  })
  category: string;

  @ApiProperty({ description: "Business industry type" })
  @Prop({ index: true })
  industry?: string;

  @ApiProperty({ description: "Original price before offer" })
  @Prop()
  originalPrice?: number;

  @ApiProperty({ description: "Discounted offer price" })
  @Prop()
  offerPrice?: number;

  @ApiProperty({ description: "Discount percentage" })
  @Prop()
  discountPercentage?: number;

  @ApiProperty({ description: "Currency code" })
  @Prop({ default: "INR" })
  currency: string;

  @ApiProperty({ description: "Offer validity start date" })
  @Prop({ type: Date })
  validFrom?: Date;

  @ApiProperty({ description: "Offer validity end date" })
  @Prop({ type: Date, index: true })
  validUntil?: Date;

  @ApiProperty({ description: "GeoJSON Point location" })
  @Prop({ type: GeoPointSchema, required: true })
  location: GeoPoint;

  @ApiProperty({ description: "Human-readable address" })
  @Prop()
  address?: string;

  @ApiProperty({
    description: "Offer status",
    enum: ["active", "expired", "draft"],
  })
  @Prop({
    type: String,
    enum: ["active", "expired", "draft"],
    default: "draft",
    index: true,
  })
  status: string;

  @ApiProperty({ description: "Free-form search tags" })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ description: "Terms and conditions" })
  @Prop()
  termsAndConditions?: string;

  @ApiProperty({ description: "Contact phone for this offer" })
  @Prop()
  contactPhone?: string;

  @ApiProperty({ description: "Contact email for this offer" })
  @Prop()
  contactEmail?: string;

  @ApiProperty({ description: "Business logo URL (denormalized)" })
  @Prop()
  businessLogoUrl?: string;

  @ApiProperty({ description: "Created timestamp" })
  createdAt?: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt?: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

// ─── Indexes ───
// 2dsphere index for geospatial proximity queries ($nearSphere)
OfferSchema.index({ location: "2dsphere" });

// Compound index for public queries (status + category + validUntil)
OfferSchema.index({ status: 1, category: 1, validUntil: 1 });

// Full-text search index
OfferSchema.index({ title: "text", description: "text", tags: "text" });
