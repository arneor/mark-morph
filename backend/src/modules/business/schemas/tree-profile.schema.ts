import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

// ---- Sub-document Schemas ----

@Schema({ _id: false })
export class TreeProfileTheme {
  @Prop() templateId?: string;
  @Prop() primaryColor: string;
  @Prop() secondaryColor?: string;
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

// ---- Main TreeProfile Schema ----

export type TreeProfileDocument = TreeProfile & Document;

@Schema({ timestamps: true, collection: "tree_profiles" })
export class TreeProfile {
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

  @ApiProperty({ description: "Logo URL for tree profile page" })
  @Prop()
  logoUrl?: string;

  @ApiProperty({ description: "S3 Key for tree profile logo" })
  @Prop()
  logoS3Key?: string;

  @ApiProperty({ description: "Theme settings" })
  @Prop({ type: TreeProfileTheme })
  theme?: TreeProfileTheme;

  @ApiProperty({ description: "Business tagline" })
  @Prop()
  tagline?: string;

  @ApiProperty({ description: "Section title for menu/catalog" })
  @Prop()
  sectionTitle?: string;

  @ApiProperty({ description: "Title for quick links section" })
  @Prop()
  linksTitle?: string;

  @ApiProperty({ description: "Profile image URL" })
  @Prop()
  profileImage?: string;

  @ApiProperty({ description: "S3 Key for profile image" })
  @Prop()
  profileImageS3Key?: string;

  @ApiProperty({ description: "Banner image URL" })
  @Prop()
  bannerImage?: string;

  @ApiProperty({ description: "S3 Key for banner image" })
  @Prop()
  bannerImageS3Key?: string;

  @ApiProperty({ description: "Opening hours" })
  @Prop({ type: Object })
  openingHours?: { start: string; end: string };

  @ApiProperty({ description: "Social media links" })
  @Prop({ type: [SocialLink], default: [] })
  socialLinks?: SocialLink[];

  @ApiProperty({ description: "Custom links" })
  @Prop({ type: [CustomLink], default: [] })
  customLinks?: CustomLink[];

  @ApiProperty({ description: "Profile banners" })
  @Prop({ type: [ProfileBannerSchema], default: [] })
  banners?: ProfileBanner[];

  @ApiProperty({ description: "Gallery images" })
  @Prop({ type: [ProfileGalleryImageSchema], default: [] })
  gallery?: ProfileGalleryImage[];

  @ApiProperty({ description: "Catalog categories" })
  @Prop({ type: [CatalogCategorySchema], default: [] })
  categories?: CatalogCategory[];

  @ApiProperty({ description: "Catalog items" })
  @Prop({ type: [CatalogItemSchema], default: [] })
  catalogItems?: CatalogItem[];

  @ApiProperty({ description: "Customer reviews" })
  @Prop({ type: [ProfileReviewSchema], default: [] })
  reviews?: ProfileReview[];

  @ApiProperty({ description: "Created timestamp" })
  createdAt?: Date;

  @ApiProperty({ description: "Updated timestamp" })
  updatedAt?: Date;
}

export const TreeProfileSchema = SchemaFactory.createForClass(TreeProfile);
