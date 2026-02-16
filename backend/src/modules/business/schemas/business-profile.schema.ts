import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

// Ad Sub-document Schema
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

export type BusinessProfileDocument = BusinessProfile & Document;

@Schema({ _id: false })
export class TreeProfileTheme {
  @Prop() primaryColor: string;
  @Prop() secondaryColor: string;
  @Prop() backgroundColor: string;
  @Prop() backgroundType: string;
  @Prop() backgroundValue: string;
  @Prop() textColor: string;
  @Prop() fontFamily: string;
  @Prop() buttonStyle: string;
  @Prop() cardStyle: string;
}

@Schema({ _id: false })
export class CustomLink {
  @Prop() id: string;
  @Prop() title: string;
  @Prop() url: string;
  @Prop() description: string;
  @Prop() icon: string;
  @Prop() style: string;
  @Prop() isActive: boolean;
}

@Schema({ _id: false })
export class SocialLink {
  @Prop() id: string;
  @Prop() platform: string;
  @Prop() url: string;
  @Prop() label: string;
}

@Schema({ _id: false })
export class ProfileBanner {
  @Prop() id: string;
  @Prop() imageUrl: string;
  @Prop() title: string;
  @Prop() linkUrl: string;
  @Prop({ default: true }) isActive: boolean;
  @Prop() s3Key: string;
}

@Schema({ _id: false })
export class ProfileGalleryImage {
  @Prop() id: string;
  @Prop() imageUrl: string;
  @Prop() caption: string;
  @Prop() s3Key: string;
}

@Schema({ _id: false })
export class CatalogCategory {
  @Prop() id: string;
  @Prop() name: string;
  @Prop() emoji: string;
}

@Schema({ _id: false })
export class CatalogItem {
  @Prop() id: string;
  @Prop() categoryId: string;
  @Prop() title: string;
  @Prop() description: string;
  @Prop() price: number;
  @Prop({ default: "INR" }) currency: string;
  @Prop() imageUrl: string;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ default: true }) isAvailable: boolean;
  @Prop() s3Key: string;
}

@Schema({ _id: false })
export class ProfileReview {
  @Prop() id: string;
  @Prop() reviewerName: string;
  @Prop() rating: number;
  @Prop() comment: string;
  @Prop() date: string;
  @Prop() avatarUrl: string;
}

export const ProfileBannerSchema = SchemaFactory.createForClass(ProfileBanner);
export const ProfileGalleryImageSchema =
  SchemaFactory.createForClass(ProfileGalleryImage);
export const CatalogCategorySchema =
  SchemaFactory.createForClass(CatalogCategory);
export const CatalogItemSchema = SchemaFactory.createForClass(CatalogItem);
export const ProfileReviewSchema = SchemaFactory.createForClass(ProfileReview);

@Schema({ timestamps: true, collection: "business_profiles" })
export class BusinessProfile {
  @ApiProperty({ description: "Unique identifier" })
  _id: Types.ObjectId;

  // ... Tree Profile Specific Fields ...
  @ApiProperty({ description: "Tree Profile Theme Settings" })
  @Prop({ type: TreeProfileTheme })
  theme?: TreeProfileTheme;

  @ApiProperty({ description: "Custom Links for Tree Profile" })
  @Prop({ type: [CustomLink], default: [] })
  customLinks?: CustomLink[];

  @ApiProperty({ description: "Social Media Links" })
  @Prop({ type: [SocialLink], default: [] })
  socialLinks?: SocialLink[];

  @ApiProperty({ description: "Section Title for Menu/Catalog" })
  @Prop()
  sectionTitle?: string;

  @ApiProperty({ description: "Title for Quick Links Section" })
  @Prop()
  linksTitle?: string;

  @ApiProperty({ description: "Business Tagline" })
  @Prop()
  tagline?: string;

  // --- Tree Profile Data ---
  @ApiProperty({ description: "Tree Profile Banners" })
  @Prop({ type: [ProfileBannerSchema], default: [] })
  banners?: ProfileBanner[];

  @ApiProperty({ description: "Tree Profile Gallery Images" })
  @Prop({ type: [ProfileGalleryImageSchema], default: [] })
  gallery?: ProfileGalleryImage[];

  @ApiProperty({ description: "Catalog Categories" })
  @Prop({ type: [CatalogCategorySchema], default: [] })
  categories?: CatalogCategory[];

  @ApiProperty({ description: "Catalog Items" })
  @Prop({ type: [CatalogItemSchema], default: [] })
  catalogItems?: CatalogItem[];

  @ApiProperty({ description: "Customer Reviews" })
  @Prop({ type: [ProfileReviewSchema], default: [] })
  reviews?: ProfileReview[];

  @ApiProperty({ description: "Profile Image URL" })
  @Prop()
  profileImage?: string;

  @ApiProperty({ description: "S3 Key for profile image" })
  @Prop()
  profileImageS3Key?: string;

  @ApiProperty({ description: "Banner Image URL" })
  @Prop()
  bannerImage?: string;

  @ApiProperty({ description: "S3 Key for banner image" })
  @Prop()
  bannerImageS3Key?: string;

  @ApiProperty({ description: "Opening hours" })
  @Prop({ type: Object })
  openingHours?: { start: string; end: string };

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

  @ApiProperty({ description: "Profile type", enum: ["private", "public"] })
  @Prop({ type: String, enum: ["private", "public"], default: "private" })
  profileType: string;

  @ApiProperty({ description: "Nested ads array", type: [Ad] })
  @Prop({ type: [AdSchema], default: [] })
  ads: Ad[];

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

export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);

// Indexes for optimized queries (ownerId index already defined in @Prop)
BusinessProfileSchema.index({ businessName: "text" });
BusinessProfileSchema.index({ category: 1 });
BusinessProfileSchema.index({ isActive: 1 });
BusinessProfileSchema.index({ status: 1 });
