import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsObject,
  ValidateNested,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";

// ---- Shared Sub-document DTOs ----

export class AdDto {
  @ApiProperty({ description: "Ad title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Media URL" })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ description: "Media type", enum: ["image", "video"] })
  @IsString()
  @IsEnum(["image", "video"])
  mediaType: string;

  @ApiProperty({ description: "Ad placement", enum: ["BANNER", "GALLERY"] })
  @IsString()
  @IsOptional()
  placement?: string;

  @ApiProperty({ description: "Ad source" })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ description: "S3 Key" })
  @IsString()
  @IsOptional()
  s3Key?: string;

  @ApiProperty({ description: "Call to action URL" })
  @IsString()
  @IsOptional()
  ctaUrl?: string;
}

export class ProfileBannerDto {
  @ApiProperty({ description: "Banner ID" })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Banner image URL" })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: "Banner title" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: "Banner link URL" })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiProperty({ description: "Whether banner is active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: "S3 Key" })
  @IsString()
  @IsOptional()
  s3Key?: string;
}

export class ProfileGalleryImageDto {
  @ApiProperty({ description: "Gallery image ID" })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Gallery image URL" })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: "Image caption" })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ description: "S3 Key" })
  @IsString()
  @IsOptional()
  s3Key?: string;
}

export class CatalogCategoryDto {
  @ApiProperty({ description: "Category ID" })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Category name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Category emoji" })
  @IsString()
  @IsOptional()
  emoji?: string;
}

export class CatalogItemDto {
  @ApiProperty({ description: "Item ID" })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Category ID" })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: "Item title" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: "Item description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Item price" })
  @IsOptional()
  price?: number;

  @ApiProperty({ description: "Currency code" })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: "Image URL" })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: "Tags" })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: "Availability" })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: "S3 Key" })
  @IsString()
  @IsOptional()
  s3Key?: string;
}

export class ProfileReviewDto {
  @ApiProperty({ description: "Review ID" })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Reviewer name" })
  @IsString()
  @IsOptional()
  reviewerName?: string;

  @ApiProperty({ description: "Rating 1-5" })
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: "Review comment" })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: "Review date" })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: "Avatar URL" })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

// ---- Core Business DTOs ----

export class CreateBusinessDto {
  @ApiProperty({ description: "Business name", example: "Joe's Coffee House" })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: "Public username for custom link",
    example: "joescafe",
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: "Business location/address",
    example: "123 Main St, Mumbai",
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: "Business category", example: "Restaurant" })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: "Business description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Contact email", example: "joe@coffee.com" })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({ description: "Contact phone", example: "+919876543210" })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ description: "WhatsApp number", example: "+919876543210" })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ description: "Logo URL", required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: "Primary brand color", example: "#4f46e5" })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({
    description: "Profile type",
    enum: ["private", "public"],
    default: "private",
  })
  @IsEnum(["private", "public"])
  @IsOptional()
  profileType?: string;

  @ApiProperty({ description: "Industry type", example: "Restaurant" })
  @IsString()
  @IsOptional()
  industryType?: string;
}

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  @ApiProperty({ description: "Whether business is active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: "Whether onboarding is completed" })
  @IsBoolean()
  @IsOptional()
  onboardingCompleted?: boolean;
}

// ---- Tree Profile DTO ----

export class UpdateTreeProfileDto {
  @ApiProperty({ description: "Logo URL for tree profile page" })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: "Theme settings" })
  @IsObject()
  @IsOptional()
  theme?: Record<string, string>;

  @ApiProperty({ description: "Business tagline" })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiProperty({ description: "Section title for menu/catalog" })
  @IsString()
  @IsOptional()
  sectionTitle?: string;

  @ApiProperty({ description: "Links section title" })
  @IsString()
  @IsOptional()
  linksTitle?: string;

  @ApiProperty({ description: "Profile image URL" })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ description: "Banner image URL" })
  @IsString()
  @IsOptional()
  bannerImage?: string;

  @ApiProperty({ description: "Opening hours" })
  @IsObject()
  @IsOptional()
  openingHours?: { start: string; end: string };

  @ApiProperty({ description: "Social links" })
  @IsOptional()
  socialLinks?: Array<Record<string, unknown>>;

  @ApiProperty({ description: "Custom links" })
  @IsOptional()
  customLinks?: Array<Record<string, unknown>>;

  @ApiProperty({ description: "Tree Profile Banners" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProfileBannerDto)
  banners?: ProfileBannerDto[];

  @ApiProperty({ description: "Tree Profile Gallery Images" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProfileGalleryImageDto)
  gallery?: ProfileGalleryImageDto[];

  @ApiProperty({ description: "Catalog Categories" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CatalogCategoryDto)
  categories?: CatalogCategoryDto[];

  @ApiProperty({ description: "Catalog Items" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CatalogItemDto)
  catalogItems?: CatalogItemDto[];

  @ApiProperty({ description: "Customer Reviews" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProfileReviewDto)
  reviews?: ProfileReviewDto[];

  @ApiProperty({ description: "WhatsApp business number (digits only)" })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ description: "Whether WhatsApp product enquiry is enabled" })
  @IsBoolean()
  @IsOptional()
  whatsappEnquiryEnabled?: boolean;
}

// ---- WiFi Profile DTO ----

export class UpdateWifiProfileDto {
  @ApiProperty({ description: "Logo URL for WiFi portal page" })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: "WiFi SSID", example: "Joes_Free_WiFi" })
  @IsString()
  @IsOptional()
  wifiSsid?: string;

  @ApiProperty({ description: "Google Review URL for CTA redirects" })
  @IsString()
  @IsOptional()
  googleReviewUrl?: string;

  @ApiProperty({ description: "Welcome banner title on splash screen" })
  @IsString()
  @IsOptional()
  welcomeTitle?: string;

  @ApiProperty({ description: "CTA Button text on splash screen" })
  @IsString()
  @IsOptional()
  ctaButtonText?: string;

  @ApiProperty({ description: "CTA Button URL on splash screen" })
  @IsString()
  @IsOptional()
  ctaButtonUrl?: string;

  @ApiProperty({ description: "Whether to show welcome banner" })
  @IsBoolean()
  @IsOptional()
  showWelcomeBanner?: boolean;

  @ApiProperty({ description: "Operating hours" })
  @IsObject()
  @IsOptional()
  operatingHours?: Record<string, string>;

  @ApiProperty({ description: "Ads/Banners list", type: [AdDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdDto)
  ads?: AdDto[];
}

// ---- Response DTOs ----

export class BusinessResponseDto {
  @ApiProperty({ description: "Business ID" })
  id: string;

  @ApiProperty({ description: "Business name" })
  businessName: string;

  @ApiProperty({ description: "Public username" })
  username?: string;

  @ApiProperty({ description: "Owner user ID" })
  ownerId: string;

  @ApiProperty({ description: "Location" })
  location?: string;

  @ApiProperty({ description: "Category" })
  category?: string;

  @ApiProperty({ description: "Logo URL" })
  logoUrl?: string;

  @ApiProperty({ description: "Primary color" })
  primaryColor: string;

  @ApiProperty({ description: "Profile type" })
  profileType: string;

  @ApiProperty({ description: "Active status" })
  isActive: boolean;

  @ApiProperty({ description: "Beet Link suspended status" })
  isBeetLinkSuspended: boolean;

  @ApiProperty({ description: "Splash suspended status" })
  isSplashSuspended: boolean;

  @ApiProperty({ description: "Onboarding completed" })
  onboardingCompleted: boolean;

  @ApiProperty({ description: "Created timestamp" })
  createdAt: Date;
}

export class DashboardStatsDto {
  @ApiProperty({ description: "Total WiFi connections" })
  totalConnections: number;

  @ApiProperty({ description: "Currently active users" })
  activeUsers: number;

  @ApiProperty({ description: "Total ads served" })
  totalAdsServed: number;

  @ApiProperty({ description: "Total ad views" })
  totalViews: number;

  @ApiProperty({ description: "Total ad clicks" })
  totalClicks: number;

  @ApiProperty({ description: "Click-through rate" })
  ctr: number;

  @ApiProperty({ description: "Estimated revenue" })
  revenue: number;

  @ApiProperty({ description: "Connection history for charts" })
  connectionsHistory: Array<{ date: string; count: number }>;
}
