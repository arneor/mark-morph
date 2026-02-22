import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { Admin, AdminDocument } from "./schemas/admin.schema";
import {
  AdminAccessLog,
  AdminAccessLogDocument,
} from "./schemas/admin-access-log.schema";
import {
  Business,
  BusinessDocument,
} from "../business/schemas/business.schema";
import {
  WifiProfile,
  WifiProfileDocument,
} from "../business/schemas/wifi-profile.schema";
import { User, UserDocument } from "../auth/schemas/user.schema";
import {
  AnalyticsLog,
  AnalyticsLogDocument,
} from "../analytics/schemas/analytics-log.schema";
import {
  ComplianceLog,
  ComplianceLogDocument,
} from "../compliance/schemas/compliance-log.schema";
import { EmailService } from "../../common/services/email.service";
import {
  AdminRequestOtpDto,
  AdminVerifyOtpDto,
  AdminAuthResponseDto,
  OtpRequestResponseDto,
  AdminStatsDto,
  BusinessListItemDto,
  BusinessActionDto,
} from "./dto/admin.dto";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // ========== ADMIN EMAIL WHITELIST ==========
  // Only these emails can access admin portal
  // To add new admin: just add email to this array
  private readonly ADMIN_EMAILS = [
    "infonidhinlal@gmail.com",
    "linkbeet@gmail.com",
    // Add more admin emails here as needed
  ];

  // ========== CONFIGURATION ==========
  private readonly OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_OTP_REQUESTS_PER_HOUR = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;
  private readonly SESSION_TIMEOUT_SECONDS = 30 * 60; // 30 minutes
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(AdminAccessLog.name)
    private accessLogModel: Model<AdminAccessLogDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(WifiProfile.name)
    private wifiProfileModel: Model<WifiProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AnalyticsLog.name)
    private analyticsModel: Model<AnalyticsLogDocument>,
    @InjectModel(ComplianceLog.name)
    private complianceModel: Model<ComplianceLogDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) { }

  /**
   * Check if email is in admin whitelist
   */
  isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Request OTP for admin login
   */
  async requestOtp(
    dto: AdminRequestOtpDto,
    ipAddress?: string,
  ): Promise<OtpRequestResponseDto> {
    const email = dto.email.toLowerCase();

    // Check if email is in admin whitelist
    if (!this.isAdminEmail(email)) {
      this.logger.warn(
        `Unauthorized admin login attempt: ${email} from ${ipAddress}`,
      );
      throw new ForbiddenException("Unauthorized email address");
    }

    // Find or create admin
    let admin = await this.adminModel.findOne({ email }).select("+otpCode");

    if (!admin) {
      // Auto-create admin on first OTP request (if in whitelist)
      this.logger.log(`Creating new admin account for: ${email}`);
      admin = new this.adminModel({
        email,
        role: "super_admin",
        name: "Admin",
      });
      await admin.save();
    }

    // Check rate limiting
    const now = new Date();
    if (admin.otpRequestResetAt && admin.otpRequestResetAt > now) {
      if (admin.otpRequestCount >= this.MAX_OTP_REQUESTS_PER_HOUR) {
        const resetTime = admin.otpRequestResetAt.getTime() - now.getTime();
        const resetMinutes = Math.ceil(resetTime / 60000);
        throw new ForbiddenException(
          `Too many OTP requests. Please try again in ${resetMinutes} minutes.`,
        );
      }
    } else {
      // Reset counter after 1 hour
      admin.otpRequestCount = 0;
      admin.otpRequestResetAt = new Date(now.getTime() + 60 * 60 * 1000);
    }

    // Check resend cooldown (prevent spam)
    if (admin.otpExpiry && admin.otpExpiry > now) {
      const timeElapsed =
        now.getTime() - (admin.otpExpiry.getTime() - this.OTP_EXPIRY_MS);
      if (timeElapsed < this.RESEND_COOLDOWN_SECONDS * 1000) {
        const cooldownRemaining = Math.ceil(
          (this.RESEND_COOLDOWN_SECONDS * 1000 - timeElapsed) / 1000,
        );
        return {
          success: false,
          message: `Please wait ${cooldownRemaining} seconds before requesting a new code`,
          cooldown: cooldownRemaining,
        };
      }
    }

    // Generate OTP
    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, this.BCRYPT_ROUNDS);

    // Update admin with new OTP
    admin.otpCode = hashedOtp;
    admin.otpExpiry = new Date(now.getTime() + this.OTP_EXPIRY_MS);
    admin.otpRequestCount += 1;
    await admin.save();

    // Send OTP via email
    try {
      await this.sendOtpEmail(email, otp);
      this.logger.log(`OTP sent to admin: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      throw new Error("Failed to send verification code. Please try again.");
    }

    return {
      success: true,
      message: "Verification code sent to your email",
      expiresIn: this.OTP_EXPIRY_MS / 1000, // 600 seconds
    };
  }

  /**
   * Send OTP email to admin
   */
  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.emailService.sendOtpEmail({
      email,
      otp,
      purpose: "admin_login",
      expiryMinutes: 10,
    });
  }

  /**
   * Verify OTP and return admin JWT
   */
  async verifyOtp(
    dto: AdminVerifyOtpDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AdminAuthResponseDto> {
    const email = dto.email.toLowerCase();
    const { otp } = dto;

    // Check if email is in admin whitelist
    if (!this.isAdminEmail(email)) {
      throw new ForbiddenException("Unauthorized email address");
    }

    // Find admin with OTP code
    const admin = await this.adminModel.findOne({ email }).select("+otpCode");

    if (!admin) {
      throw new UnauthorizedException(
        "Please request a verification code first",
      );
    }

    // Check if OTP exists
    if (!admin.otpCode || !admin.otpExpiry) {
      throw new UnauthorizedException(
        "Please request a verification code first",
      );
    }

    // Check if OTP expired
    if (new Date() > admin.otpExpiry) {
      throw new UnauthorizedException(
        "Verification code has expired. Please request a new one.",
      );
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, admin.otpCode);
    if (!isOtpValid) {
      throw new UnauthorizedException("Invalid verification code");
    }

    // Clear OTP after successful verification (one-time use)
    admin.otpCode = undefined;
    admin.otpExpiry = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate Admin JWT
    const adminSecret =
      this.configService.get<string>("JWT_ADMIN_SECRET") ||
      this.configService.get<string>("JWT_SECRET") + "_admin";

    const payload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      type: "admin",
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: adminSecret,
      expiresIn: `${this.SESSION_TIMEOUT_SECONDS}s`,
    });

    // Log the login
    await this.logAccess(
      admin._id,
      admin.email,
      "login",
      undefined,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Admin logged in: ${email}`);

    return {
      accessToken,
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      expiresIn: this.SESSION_TIMEOUT_SECONDS,
    };
  }

  /**
   * Validate admin JWT token
   */
  async validateAdminToken(payload: any): Promise<AdminDocument | null> {
    if (payload.type !== "admin") {
      return null;
    }

    const admin = await this.adminModel.findById(payload.sub);
    if (!admin || !admin.isActive) {
      return null;
    }

    // Double-check email is still in whitelist
    if (!this.isAdminEmail(admin.email)) {
      return null;
    }

    return admin;
  }

  /**
   * Log admin access for audit
   */
  async logAccess(
    adminId: Types.ObjectId,
    adminEmail: string,
    action: string,
    businessId?: Types.ObjectId,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      const log = new this.accessLogModel({
        adminId,
        adminEmail,
        action,
        businessId,
        ipAddress,
        userAgent,
        details,
        timestamp: new Date(),
      });
      await log.save();
    } catch (error) {
      this.logger.error(`Failed to log admin access: ${error.message}`);
    }
  }

  /**
   * Get platform-wide statistics
   */
  async getStats(): Promise<AdminStatsDto> {
    const [
      totalBusinesses,
      pendingApprovalCount,
      totalConnections,
      totalEmailsCollected,
    ] = await Promise.all([
      this.businessModel.countDocuments({ status: "active" }),
      this.businessModel.countDocuments({ status: "pending_approval" }),
      this.complianceModel.countDocuments(),
      this.userModel.countDocuments({ email: { $exists: true, $ne: null } }),
    ]);

    // Count total active ads across all WiFi profiles
    const allWifiProfiles = await this.wifiProfileModel.find({}, { ads: 1 });
    const totalActiveCampaigns = allWifiProfiles.reduce((sum, wp) => {
      return (
        sum + (wp.ads?.filter((ad) => ad.status === "active")?.length || 0)
      );
    }, 0);

    // Calculate growth rate
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBusinesses = await this.businessModel.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const growthRate =
      totalBusinesses > 0 ? (recentBusinesses / totalBusinesses) * 100 : 0;

    return {
      totalBusinesses,
      totalConnections,
      totalActiveCampaigns,
      totalEmailsCollected,
      growthRate: Math.round(growthRate * 100) / 100,
      pendingApprovalCount,
    };
  }

  /**
   * Get all businesses with connection counts
   */
  async getAllBusinesses(): Promise<BusinessListItemDto[]> {
    const businesses = await this.businessModel
      .find()
      .sort({ createdAt: -1 })
      .populate("ownerId", "phone email name")
      .lean();

    const result: BusinessListItemDto[] = [];

    for (const biz of businesses) {
      const connectionCount = await this.complianceModel.countDocuments({
        businessId: biz._id,
      });

      const owner = biz.ownerId as any;

      result.push({
        id: biz._id.toString(),
        businessName: biz.businessName,
        username: biz.username || "",
        ownerPhone: owner?.phone,
        ownerEmail: owner?.email,
        location: biz.location,
        category: biz.category,
        adsCount: 0, // Ads now in wifi_profiles collection
        connectionCount,
        isActive: biz.isActive,
        isBeetLinkSuspended: biz.isBeetLinkSuspended || false,
        isSplashSuspended: biz.isSplashSuspended || false,
        status: biz.status || "pending_approval",
        rejectionReason: biz.rejectionReason,
        suspensionReason: biz.suspensionReason,
        createdAt: biz.createdAt as any,
      });
    }

    return result;
  }

  /**
   * Get pending approval businesses
   */
  async getPendingBusinesses(): Promise<BusinessListItemDto[]> {
    const businesses = await this.businessModel
      .find({ status: "pending_approval" })
      .sort({ createdAt: 1 })
      .populate("ownerId", "phone email name")
      .lean();

    const result: BusinessListItemDto[] = [];

    for (const biz of businesses) {
      const owner = biz.ownerId as any;

      result.push({
        id: biz._id.toString(),
        businessName: biz.businessName,
        username: biz.username || "",
        ownerPhone: owner?.phone,
        ownerEmail: owner?.email,
        location: biz.location,
        category: biz.category,
        adsCount: 0, // Ads now in wifi_profiles collection
        connectionCount: 0,
        isActive: biz.isActive,
        isBeetLinkSuspended: biz.isBeetLinkSuspended || false,
        isSplashSuspended: biz.isSplashSuspended || false,
        status: biz.status,
        createdAt: biz.createdAt as any,
      });
    }

    return result;
  }

  /**
   * Activate a business
   */
  async activateBusiness(
    businessId: string,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.status = "active";
    business.isActive = true;
    business.activatedBy = adminId;
    business.activatedAt = new Date();
    business.rejectionReason = undefined;
    business.suspensionReason = undefined;
    business.statusHistory.push({
      status: "active",
      changedBy: adminId,
      changedAt: new Date(),
    });

    await business.save();

    // Also mark the owner User as verified
    await this.userModel.findByIdAndUpdate(business.ownerId, {
      isVerified: true,
    });

    await this.logAccess(
      adminId,
      adminEmail,
      "activate_business",
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName },
    );

    this.logger.log(
      `Business activated: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0, // Ads now in wifi_profiles collection
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended ?? false,
      isSplashSuspended: business.isSplashSuspended ?? false,
      status: business.status,
      createdAt: business.createdAt as any,
    };
  }

  /**
   * Reject a business
   */
  async rejectBusiness(
    businessId: string,
    dto: BusinessActionDto,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.status = "rejected";
    business.isActive = false;
    business.rejectionReason = dto.reason;
    business.statusHistory.push({
      status: "rejected",
      changedBy: adminId,
      changedAt: new Date(),
      reason: dto.reason,
    });

    await business.save();

    // Revoke owner User verification
    await this.userModel.findByIdAndUpdate(business.ownerId, {
      isVerified: false,
    });

    await this.logAccess(
      adminId,
      adminEmail,
      "reject_business",
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName, reason: dto.reason },
    );

    this.logger.log(
      `Business rejected: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0, // Ads now in wifi_profiles collection
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended ?? false,
      isSplashSuspended: business.isSplashSuspended ?? false,
      status: business.status,
      rejectionReason: business.rejectionReason,
      createdAt: business.createdAt as any,
    };
  }

  /**
   * Suspend a business
   */
  async suspendBusiness(
    businessId: string,
    dto: BusinessActionDto,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.status = "suspended";
    business.isActive = false;
    business.suspensionReason = dto.reason;
    business.statusHistory.push({
      status: "suspended",
      changedBy: adminId,
      changedAt: new Date(),
      reason: dto.reason,
    });

    await business.save();

    // Revoke owner User verification
    await this.userModel.findByIdAndUpdate(business.ownerId, {
      isVerified: false,
    });

    await this.logAccess(
      adminId,
      adminEmail,
      "suspend_business",
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName, reason: dto.reason },
    );

    this.logger.log(
      `Business suspended: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0, // Ads now in wifi_profiles collection
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended ?? false,
      isSplashSuspended: business.isSplashSuspended ?? false,
      status: business.status,
      suspensionReason: business.suspensionReason,
      createdAt: business.createdAt as any,
    };
  }

  // ---- Fine-Grained Access Controls ----

  /**
   * Approve a Beet Link profile
   * This also activates the overall business if it is pending approval.
   */
  async approveBeetLink(
    businessId: string,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.isBeetLinkSuspended = false;

    // If the overall business is still pending approval, activate it when Beet Link is approved.
    if (business.status === "pending_approval") {
      business.status = "active";
      business.isActive = true;
      business.activatedBy = adminId;
      business.activatedAt = new Date();
      business.statusHistory.push({
        status: "active",
        changedBy: adminId,
        changedAt: new Date(),
      });

      // Also ensure the owner user is verified
      await this.userModel.findByIdAndUpdate(business.ownerId, {
        isVerified: true,
      });
    }

    await business.save();

    await this.logAccess(
      adminId,
      adminEmail,
      "approve_beet_link",
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName },
    );

    this.logger.log(
      `Beet Link approved for: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0,
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended,
      isSplashSuspended: business.isSplashSuspended,
      status: business.status,
      createdAt: business.createdAt as any,
    };
  }

  /**
   * Suspend/Unsuspend a Beet Link profile
   */
  async suspendBeetLink(
    businessId: string,
    dto: BusinessActionDto | null,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
    isSuspended: boolean = true,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.isBeetLinkSuspended = isSuspended;

    await business.save();

    const actionText = isSuspended ? "suspend_beet_link" : "unsuspend_beet_link";
    await this.logAccess(
      adminId,
      adminEmail,
      actionText,
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName, reason: dto?.reason },
    );

    this.logger.log(
      `Beet Link ${isSuspended ? 'suspended' : 'unsuspended'} for: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0,
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended,
      isSplashSuspended: business.isSplashSuspended,
      status: business.status,
      createdAt: business.createdAt as any,
    };
  }

  /**
   * Suspend/Unsuspend a Splash page
   */
  async suspendSplash(
    businessId: string,
    dto: BusinessActionDto | null,
    adminId: Types.ObjectId,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
    isSuspended: boolean = true,
  ): Promise<BusinessListItemDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    business.isSplashSuspended = isSuspended;

    await business.save();

    const actionText = isSuspended ? "suspend_splash" : "unsuspend_splash";
    await this.logAccess(
      adminId,
      adminEmail,
      actionText,
      business._id as Types.ObjectId,
      ipAddress,
      userAgent,
      { businessName: business.businessName, reason: dto?.reason },
    );

    this.logger.log(
      `Splash ${isSuspended ? 'suspended' : 'unsuspended'} for: ${business.businessName} by admin: ${adminEmail}`,
    );

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      location: business.location,
      category: business.category,
      adsCount: 0,
      connectionCount: 0,
      isActive: business.isActive,
      isBeetLinkSuspended: business.isBeetLinkSuspended,
      isSplashSuspended: business.isSplashSuspended,
      status: business.status,
      createdAt: business.createdAt as any,
    };
  }

  /**
   * Get admin access logs for a business
   */
  async getBusinessAccessLogs(businessId: string): Promise<any[]> {
    return this.accessLogModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
  }

  /**
   * Get total connection count for platform
   */
  async getTotalConnectionCount(): Promise<number> {
    return this.complianceModel.countDocuments();
  }

  /**
   * Get detailed business insights for admin
   */
  async getBusinessDetails(businessId: string): Promise<any> {
    const business = await this.businessModel
      .findById(businessId)
      .populate("ownerId", "phone email name")
      .lean();

    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const owner = business.ownerId as any;
    const connectionCount = await this.complianceModel.countDocuments({
      businessId: business._id,
    });

    // Get WiFi profile for ad metrics
    const wifiProfile = await this.wifiProfileModel.findOne({
      businessId: business._id,
    });

    // Aggregate Metrics from Ads
    let totalAdViews = 0;
    let totalAdClicks = 0;
    let totalAdLikes = 0;
    let totalAdShares = 0;
    let totalAdExpands = 0;

    const ads = wifiProfile?.ads || [];
    const topPosts = ads
      .map((ad: any) => {
        const views = ad.views || 0;
        const clicks = ad.clicks || 0;
        const likes = ad.likesCount || 0;
        const shares = ad.sharesCount || 0;
        const expands = ad.expandsCount || 0;

        // Simple performance score: views * 1 + clicks * 5 + likes * 3 + shares * 10
        const score =
          views * 1 + clicks * 5 + likes * 3 + shares * 10 + expands * 2;

        totalAdViews += views;
        totalAdClicks += clicks;
        totalAdLikes += likes;
        totalAdShares += shares;
        totalAdExpands += expands;

        return {
          id: ad.id?.toString(),
          title: ad.title,
          mediaUrl: ad.mediaUrl,
          status: ad.status,
          placement: ad.placement,
          views,
          clicks,
          likes,
          shares,
          expands,
          performanceScore: score,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore); // Sort by highest performing

    const avgCtr = totalAdViews > 0 ? (totalAdClicks / totalAdViews) * 100 : 0;

    return {
      id: business._id.toString(),
      businessName: business.businessName,
      username: business.username || "",
      ownerPhone: owner?.phone,
      ownerEmail: owner?.email,
      ownerName: owner?.name,
      location: business.location,
      category: business.category,
      description: business.description,
      contactEmail: business.contactEmail,
      contactPhone: business.contactPhone,
      logoUrl: business.logoUrl,
      wifiSsid: wifiProfile?.wifiSsid,
      googleReviewUrl: wifiProfile?.googleReviewUrl,
      profileType: business.profileType,

      isActive: business.isActive,
      status: business.status,
      isBeetLinkSuspended: business.isBeetLinkSuspended ?? false,
      isSplashSuspended: business.isSplashSuspended ?? false,
      rejectionReason: business.rejectionReason,
      suspensionReason: business.suspensionReason,

      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      activatedAt: business.activatedAt,

      // Stats
      adsCount: ads.length,
      connectionCount,

      // Aggregated Deep Insights
      totalAdViews,
      totalAdClicks,
      totalAdLikes,
      totalAdShares,
      totalAdExpands,
      avgCtr: Math.round(avgCtr * 100) / 100,

      topPosts,
    };
  }

  /**
   * Get granular interaction details for a specific ad
   */
  async getAdInteractionDetails(adId: string): Promise<any[]> {
    const logs = await this.analyticsModel
      .find({ adId: new Types.ObjectId(adId) })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("userId", "email name")
      .lean();

    return logs.map((log: any) => ({
      id: log._id,
      interactionType: log.interactionType,
      timestamp: log.timestamp,
      deviceType: log.deviceType,
      // Prioritize linked user data, fallback to captured email or anonymous
      userEmail: log.userId?.email || log.email || "Anonymous",
      userName: log.userId?.name || "Guest",
      isAnonymous: !log.userId && !log.email,
    }));
  }
}
