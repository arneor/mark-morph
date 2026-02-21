import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from "class-validator";

/**
 * Request OTP for admin login
 */
export class AdminRequestOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * Verify OTP for admin login
 */
export class AdminVerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  otp: string;
}

/**
 * Admin authentication response
 */
export class AdminAuthResponseDto {
  accessToken: string;
  adminId: string;
  email: string;
  role: string;
  expiresIn: number; // seconds
}

/**
 * OTP request response
 */
export class OtpRequestResponseDto {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until OTP expires
  cooldown?: number; // seconds until can resend
}

/**
 * Platform statistics for admin dashboard
 */
export class AdminStatsDto {
  totalBusinesses: number;
  totalConnections: number;
  totalActiveCampaigns: number;
  totalEmailsCollected: number;
  growthRate?: number;
  pendingApprovalCount: number;
}

/**
 * Business list item for admin view
 */
export class BusinessListItemDto {
  id: string;
  businessName: string;
  username: string;
  ownerPhone?: string;
  ownerEmail?: string;
  location?: string;
  category?: string;
  adsCount: number;
  connectionCount: number;
  isActive: boolean;
  isBeetLinkSuspended: boolean;
  isSplashSuspended: boolean;
  status: string;
  rejectionReason?: string;
  suspensionReason?: string;
  createdAt: Date;
}

/**
 * Business action (reject/suspend with reason)
 */
export class BusinessActionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Detailed business view for admin
 */
export class BusinessDetailsDto extends BusinessListItemDto {
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  wifiSsid?: string;
  googleReviewUrl?: string;
  updatedAt?: Date;
  activatedAt?: Date;

  // Aggregated Metrics
  totalAdViews: number;
  totalAdClicks: number;
  totalAdLikes: number;
  totalAdShares: number;
  totalAdExpands: number;
  avgCtr: number;

  // Detailed Post List
  topPosts: Array<{
    id: string;
    title: string;
    mediaUrl: string;
    status: string;
    views: number;
    clicks: number;
    likes: number;
    shares: number;
    expands: number;
    performanceScore: number; // custom metric
  }>;
}
