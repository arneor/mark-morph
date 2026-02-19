import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Business, BusinessDocument } from "./schemas/business.schema";
import {
  TreeProfile,
  TreeProfileDocument,
} from "./schemas/tree-profile.schema";
import {
  WifiProfile,
  WifiProfileDocument,
  Ad,
} from "./schemas/wifi-profile.schema";
import {
  AnalyticsLog,
  AnalyticsLogDocument,
} from "../analytics/schemas/analytics-log.schema";
import {
  ComplianceLog,
  ComplianceLogDocument,
} from "../compliance/schemas/compliance-log.schema";
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  UpdateTreeProfileDto,
  UpdateWifiProfileDto,
  DashboardStatsDto,
} from "./dto/business.dto";

import { S3Service } from "../media/s3.service";

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(TreeProfile.name)
    private treeProfileModel: Model<TreeProfileDocument>,
    @InjectModel(WifiProfile.name)
    private wifiProfileModel: Model<WifiProfileDocument>,
    @InjectModel(AnalyticsLog.name)
    private analyticsModel: Model<AnalyticsLogDocument>,
    @InjectModel(ComplianceLog.name)
    private complianceModel: Model<ComplianceLogDocument>,
    private readonly s3Service: S3Service,
  ) { }

  // ---- Media Upload ----

  async uploadMedia(
    businessId: string,
    file: Express.Multer.File,
    placement: string,
    ownerId: string,
    isAdmin: boolean = false,
  ) {
    const business = await this.findById(businessId);
    if (!isAdmin && business.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        "You do not have permission to upload media for this business",
      );
    }

    const { url, key } = await this.s3Service.upload(
      file,
      "business",
      businessId,
      placement,
    );

    if (placement === "branding") {
      // Shared logo (fallback)
      if (business.logoS3Key) {
        await this.s3Service.delete(business.logoS3Key);
      }
      business.logoUrl = url;
      business.logoS3Key = key;
      await business.save();
    } else if (placement === "branding-tree") {
      // Tree profile page logo
      const treeProfile = await this.findOrCreateTreeProfile(businessId);
      if (treeProfile.logoS3Key) {
        await this.s3Service.delete(treeProfile.logoS3Key);
      }
      treeProfile.logoUrl = url;
      treeProfile.logoS3Key = key;
      await treeProfile.save();
    } else if (placement === "branding-wifi") {
      // WiFi portal page logo
      const wifiProfile = await this.findOrCreateWifiProfile(businessId);
      if (wifiProfile.logoS3Key) {
        await this.s3Service.delete(wifiProfile.logoS3Key);
      }
      wifiProfile.logoUrl = url;
      wifiProfile.logoS3Key = key;
      await wifiProfile.save();
    } else if (placement.startsWith("tree-profile-")) {
      // Tree-profile banners/gallery/catalog/profile uploads
      // Return URL and key — frontend includes them in the subsequent update call
    } else if (placement === "banner" || placement === "gallery") {
      const wifiProfile = await this.findOrCreateWifiProfile(businessId);
      const adPlacement = placement === "banner" ? "BANNER" : "GALLERY";

      wifiProfile.ads.push({
        mediaUrl: url,
        mediaType: file.mimetype.startsWith("video") ? "video" : "image",
        title: file.originalname,
        s3Key: key,
        placement: adPlacement,
        source: "INTERNAL",
        status: "active",
        duration: 5,
        views: 0,
        clicks: 0,
        createdAt: new Date(),
      } as any);
      await wifiProfile.save();
    }

    this.logger.log(`Uploaded media for business ${businessId}: ${placement}`);
    return { url, key, business };
  }

  // ---- Create ----

  async create(
    ownerId: string,
    dto: CreateBusinessDto,
  ): Promise<BusinessDocument> {
    if (dto.username) {
      const existing = await this.businessModel.findOne({
        username: dto.username,
      });
      if (existing) {
        throw new ForbiddenException("Username is already taken");
      }
    }

    const business = new this.businessModel({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
      status: "pending_approval",
      isActive: false,
      statusHistory: [
        {
          status: "pending_approval",
          changedAt: new Date(),
        },
      ],
    });

    await business.save();

    // Auto-create empty profile documents for both products
    await this.treeProfileModel.create({ businessId: business._id });
    await this.wifiProfileModel.create({ businessId: business._id });

    this.logger.log(
      `Created business: ${business.businessName} for owner: ${ownerId} (pending approval)`,
    );
    return business;
  }

  // ---- Find Methods ----

  async findById(id: string): Promise<BusinessDocument> {
    const business = await this.businessModel.findById(id);
    if (!business) {
      throw new NotFoundException("Business not found");
    }
    return business;
  }

  async findByOwnerId(ownerId: string): Promise<BusinessDocument | null> {
    return this.businessModel.findOne({ ownerId: new Types.ObjectId(ownerId) });
  }

  async findByUsername(username: string): Promise<BusinessDocument> {
    const business = await this.businessModel.findOne({ username });
    if (!business) {
      throw new NotFoundException("Business not found");
    }
    return business;
  }

  async findAll(): Promise<BusinessDocument[]> {
    return this.businessModel
      .find({ status: "active" })
      .sort({ createdAt: -1 });
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const count = await this.businessModel.countDocuments({ username });
    return count === 0;
  }

  // ---- Profile Finders ----

  async findTreeProfile(
    businessId: string,
  ): Promise<TreeProfileDocument | null> {
    return this.treeProfileModel.findOne({
      businessId: new Types.ObjectId(businessId),
    });
  }

  async findWifiProfile(
    businessId: string,
  ): Promise<WifiProfileDocument | null> {
    return this.wifiProfileModel.findOne({
      businessId: new Types.ObjectId(businessId),
    });
  }

  async findOrCreateTreeProfile(
    businessId: string,
  ): Promise<TreeProfileDocument> {
    let profile = await this.treeProfileModel.findOne({
      businessId: new Types.ObjectId(businessId),
    });
    if (!profile) {
      profile = await this.treeProfileModel.create({
        businessId: new Types.ObjectId(businessId),
      });
    }
    return profile;
  }

  async findOrCreateWifiProfile(
    businessId: string,
  ): Promise<WifiProfileDocument> {
    let profile = await this.wifiProfileModel.findOne({
      businessId: new Types.ObjectId(businessId),
    });
    if (!profile) {
      profile = await this.wifiProfileModel.create({
        businessId: new Types.ObjectId(businessId),
      });
    }
    return profile;
  }

  // ---- Merged Finders (for API responses that need combined data) ----

  async getFullBusiness(id: string) {
    const business = await this.findById(id);
    const [treeProfile, wifiProfile] = await Promise.all([
      this.findTreeProfile(id),
      this.findWifiProfile(id),
    ]);

    return this.mergeBusinessData(business, treeProfile, wifiProfile);
  }

  async getFullBusinessByUsername(username: string) {
    const business = await this.findByUsername(username);
    const businessId = business._id.toString();
    const [treeProfile, wifiProfile] = await Promise.all([
      this.findTreeProfile(businessId),
      this.findWifiProfile(businessId),
    ]);

    return this.mergeBusinessData(business, treeProfile, wifiProfile);
  }

  async getFullBusinessByOwnerId(ownerId: string) {
    const business = await this.findByOwnerId(ownerId);
    if (!business) return null;

    const businessId = business._id.toString();
    const [treeProfile, wifiProfile] = await Promise.all([
      this.findTreeProfile(businessId),
      this.findWifiProfile(businessId),
    ]);

    return this.mergeBusinessData(business, treeProfile, wifiProfile);
  }

  private mergeBusinessData(
    business: BusinessDocument,
    treeProfile: TreeProfileDocument | null,
    wifiProfile: WifiProfileDocument | null,
  ) {
    const biz = business.toObject();
    const tree = treeProfile?.toObject() || {};
    const wifi = wifiProfile?.toObject() || {};

    // Flatten all into one response for frontend compatibility
    return {
      ...biz,
      id: biz._id?.toString(),
      // Tree profile fields
      theme: tree.theme,
      tagline: tree.tagline,
      sectionTitle: tree.sectionTitle,
      linksTitle: tree.linksTitle,
      profileImage: tree.profileImage,
      profileImageS3Key: tree.profileImageS3Key,
      bannerImage: tree.bannerImage,
      bannerImageS3Key: tree.bannerImageS3Key,
      openingHours: tree.openingHours,
      socialLinks: tree.socialLinks || [],
      customLinks: tree.customLinks || [],
      banners: tree.banners || [],
      gallery: tree.gallery || [],
      categories: tree.categories || [],
      catalogItems: tree.catalogItems || [],
      reviews: tree.reviews || [],
      // WiFi profile fields
      wifiSsid: wifi.wifiSsid,
      googleReviewUrl: wifi.googleReviewUrl,
      welcomeTitle: wifi.welcomeTitle,
      ctaButtonText: wifi.ctaButtonText,
      ctaButtonUrl: wifi.ctaButtonUrl,
      showWelcomeBanner: wifi.showWelcomeBanner,
      operatingHours: wifi.operatingHours,
      ads: wifi.ads || [],
    };
  }

  // ---- Update Methods ----

  async update(
    id: string,
    ownerId: string,
    dto: UpdateBusinessDto,
    isAdmin: boolean = false,
  ): Promise<BusinessDocument> {
    const business = await this.businessModel.findById(id);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    if (!isAdmin && business.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        "You do not have permission to update this business",
      );
    }

    if (!isAdmin) {
      delete (dto as any).status;
      delete (dto as any).isActive;
    }

    Object.assign(business, dto);
    await business.save();

    this.logger.log(
      `Updated business: ${business.businessName}${isAdmin ? " (by admin)" : ""}`,
    );
    return business;
  }

  async updateTreeProfile(
    businessId: string,
    ownerId: string,
    dto: UpdateTreeProfileDto,
    isAdmin: boolean = false,
  ): Promise<TreeProfileDocument> {
    const business = await this.findById(businessId);
    if (!isAdmin && business.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        "You do not have permission to update this business",
      );
    }

    const treeProfile = await this.findOrCreateTreeProfile(businessId);

    if (dto.socialLinks) {
      dto.socialLinks = this.sanitizeAndFormatLinks(dto.socialLinks);
      this.validateSocialLinks(dto.socialLinks);
    }

    // Also sanitize customLinks for XSS prevention and Smart Link formatting
    if (dto.customLinks) {
      dto.customLinks = (dto.customLinks as any[]).map((link: any) => {
        if (!link.url) return link;
        const url = link.url.trim();

        // XSS prevention
        if (/^\s*javascript:/i.test(url)) {
          throw new ForbiddenException('Invalid URL format: dangerous protocol detected');
        }

        // Smart Link: auto-detect phone numbers
        if (this.isPhoneNumber(url)) {
          const normalized = url.replace(/[\s()-]/g, '');
          return { ...link, url: `tel:${normalized}` };
        }

        // Smart Link: already tel: or mailto:
        if (/^(?:tel:|mailto:)/i.test(url)) {
          return { ...link, url };
        }

        // Smart Link: bare email address
        if (/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(url)) {
          return { ...link, url: `mailto:${url}` };
        }

        // Standard URL: ensure protocol
        if (!url.startsWith('http')) {
          return { ...link, url: `https://${url}` };
        }

        return { ...link, url };
      });
    }

    Object.assign(treeProfile, dto);
    await treeProfile.save();

    this.logger.log(`Updated tree profile for business ${businessId}`);
    return treeProfile;
  }

  async updateWifiProfile(
    businessId: string,
    ownerId: string,
    dto: UpdateWifiProfileDto,
    isAdmin: boolean = false,
  ): Promise<WifiProfileDocument> {
    const business = await this.findById(businessId);
    if (!isAdmin && business.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        "You do not have permission to update this business",
      );
    }

    const wifiProfile = await this.findOrCreateWifiProfile(businessId);

    // Handle S3 image deletion when ads are removed
    if (dto.ads) {
      const oldS3Keys = wifiProfile.ads
        .map((ad) => ad.s3Key)
        .filter((key): key is string => !!key);

      const newS3Keys = new Set(
        dto.ads.map((ad) => ad.s3Key).filter((key): key is string => !!key),
      );

      const keysToDelete = oldS3Keys.filter((key) => !newS3Keys.has(key));

      if (keysToDelete.length > 0) {
        this.logger.log(
          `Deleting ${keysToDelete.length} orphaned S3 images for business ${businessId}`,
        );
        Promise.allSettled(
          keysToDelete.map((key) => this.s3Service.delete(key)),
        ).catch((err) =>
          this.logger.error(`Error deleting orphan S3 images: ${err.message}`),
        );
      }
    }

    Object.assign(wifiProfile, dto);
    await wifiProfile.save();

    this.logger.log(`Updated WiFi profile for business ${businessId}`);
    return wifiProfile;
  }

  // ---- Dashboard Stats ----

  async getDashboardStats(
    businessId: string,
    ownerId: string,
    isAdmin: boolean = false,
  ): Promise<DashboardStatsDto> {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    if (!isAdmin && business.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        "You do not have permission to view this dashboard",
      );
    }

    const businessObjectId = new Types.ObjectId(businessId);
    const wifiProfile = await this.findWifiProfile(businessId);

    const [viewsResult, clicksResult, connectionsResult] = await Promise.all([
      this.analyticsModel.countDocuments({
        businessId: businessObjectId,
        interactionType: "view",
      }),
      this.analyticsModel.countDocuments({
        businessId: businessObjectId,
        interactionType: "click",
      }),
      this.complianceModel.countDocuments({
        businessId: businessObjectId,
      }),
    ]);

    const ads = wifiProfile?.ads || [];
    const totalAdViews = ads.reduce(
      (sum: number, ad: Ad) => sum + (ad.views || 0),
      0,
    );
    const totalAdClicks = ads.reduce(
      (sum: number, ad: Ad) => sum + (ad.clicks || 0),
      0,
    );

    const connectionsHistory =
      await this.getConnectionsHistory(businessObjectId);
    const ctr = totalAdViews > 0 ? (totalAdClicks / totalAdViews) * 100 : 0;

    return {
      totalConnections: connectionsResult,
      activeUsers: 0,
      totalAdsServed: totalAdViews,
      totalViews: viewsResult || totalAdViews,
      totalClicks: clicksResult || totalAdClicks,
      ctr: Math.round(ctr * 100) / 100,
      revenue: 0,
      connectionsHistory,
    };
  }

  // ---- Splash Page ----

  async getSplashData(businessId: string) {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    if (business.status !== "active") {
      throw new NotFoundException("This WiFi network is currently unavailable");
    }

    const wifiProfile = await this.findWifiProfile(businessId);
    const ads = wifiProfile?.ads || [];
    const activeAds = ads.filter((ad: Ad) => ad.status === "active");

    return {
      business: {
        id: business._id,
        name: business.businessName,
        location: business.location,
        logoUrl: business.logoUrl,
        primaryColor: business.primaryColor,
        googleReviewUrl: wifiProfile?.googleReviewUrl,
        description: business.description,
        category: business.category,
        wifiSsid: wifiProfile?.wifiSsid,
        welcomeTitle: wifiProfile?.welcomeTitle,
        ctaButtonText: wifiProfile?.ctaButtonText || "View Offers",
        ctaButtonUrl: wifiProfile?.ctaButtonUrl,
        showWelcomeBanner: wifiProfile?.showWelcomeBanner !== false,
      },
      ads: activeAds.map((ad: Ad) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        ctaUrl: ad.ctaUrl || wifiProfile?.googleReviewUrl,
        duration: ad.duration,
        placement: ad.placement,
        status: ad.status,
        likesCount: ad.likesCount || 0,
      })),
    };
  }

  // ---- Helpers ----

  private async getConnectionsHistory(
    businessId: Types.ObjectId,
  ): Promise<Array<{ date: string; count: number }>> {
    const days = 7;
    const history: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - i);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const count = await this.complianceModel.countDocuments({
        businessId,
        loginTime: { $gte: startDate, $lte: endDate },
      });

      history.push({
        date: startDate.toISOString().split("T")[0],
        count: count,
      });
    }

    return history;
  }

  async getAdminAccessLogs(businessId: string): Promise<any[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mongoose = require("mongoose");
      const AdminAccessLog = mongoose.model("AdminAccessLog");

      const logs = await AdminAccessLog.find({
        businessId: new Types.ObjectId(businessId),
      })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      return logs.map((log: any) => ({
        id: log._id.toString(),
        adminEmail: log.adminEmail,
        action: log.action,
        timestamp: log.timestamp,
        details: log.details,
      }));
    } catch (error) {
      this.logger.warn(`Could not fetch admin access logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Detects if a string looks like a phone number (E.164-compatible).
   * Matches: +1234567890, 1234567890, (123) 456-7890, +91 98765 43210
   */
  private isPhoneNumber(input: string): boolean {
    const cleaned = input.trim();
    if (!/^[+\d]/.test(cleaned)) return false;
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    // 7-15 digits per ITU-T E.164
    return digitsOnly.length >= 7 && digitsOnly.length <= 15 && /^[+\d\s()-]+$/.test(cleaned);
  }

  /**
   * Sanitizes and formats social links before storage.
   * - Auto-prefixes phone numbers with tel:
   * - Auto-prefixes emails with mailto:
   * - Blocks javascript: URLs (XSS prevention)
   * - Normalizes phone numbers for E.164 compatibility
   */
  private sanitizeAndFormatLinks(socialLinks: any[]): any[] {
    return socialLinks.map(link => {
      if (!link.url) return link;
      const url = link.url.trim();

      // XSS prevention: block dangerous protocols
      if (/^\s*javascript:/i.test(url)) {
        throw new ForbiddenException('Invalid URL format: dangerous protocol detected');
      }

      // Auto-format phone platform
      if (link.platform === 'phone') {
        const clean = url.replace(/^tel:/, '').trim();
        if (this.isPhoneNumber(clean)) {
          const normalized = clean.replace(/[\s()-]/g, '');
          return { ...link, url: `tel:${normalized}` };
        }
      }

      // Auto-format email platform
      if (link.platform === 'email') {
        const clean = url.replace(/^mailto:/, '').trim();
        if (/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean)) {
          return { ...link, url: `mailto:${clean}` };
        }
      }

      return { ...link, url };
    });
  }

  /**
   * Validates social links against platform-specific regex patterns.
   *
   * All URL regexes allow optional trailing paths and query parameters
   * (e.g. ?igsh=..., ?utm_source=..., ?ref=...) to support:
   * - Mobile share links (Instagram ?igsh, TikTok, etc.)
   * - UTM tracking parameters
   * - Deep-linking parameters for mobile app redirection
   *
   * Patterns are anchored with ^ and $ to prevent partial match bypasses.
   * Regexes are kept in sync with frontend validation.ts patterns.
   */
  private validateSocialLinks(socialLinks: any[]) {
    // ── Platform regex map ──
    // All patterns allow optional trailing path segments and query strings
    // Pattern structure: ^<domain-match>/<path-match>(?:/[^?]*)?(\?[^\s]*)?/?$
    const REGEX_MAP = {
      instagram: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      facebook: /^(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      twitter: /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      youtube: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:channel\/|c\/|user\/|@|shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      linkedin: /^(?:https?:\/\/)?(?:[a-z]{2}\.)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      tiktok: /^(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com)\/@?([a-zA-Z0-9_.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
      whatsapp: /^(?:https?:\/\/)?(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)(\+?\d+)(\?[^\s]*)?/,
      email: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
      phone: /^\+?([0-9\s()-]{7,})$/,
    };

    for (const link of socialLinks) {
      // Skip if platform is unknown or url is missing
      if (!link.platform || !link.url) continue;

      const regex = REGEX_MAP[link.platform as keyof typeof REGEX_MAP];
      if (!regex) continue; // Unknown platform — allow through

      if (link.platform === 'email') {
        const clean = link.url.replace(/^mailto:/, '').trim();
        if (!regex.test(clean)) {
          throw new ForbiddenException(
            `Invalid email address. Please provide a valid email like user@example.com`,
          );
        }
      } else if (link.platform === 'phone') {
        const clean = link.url.replace(/^tel:/, '').trim();
        if (!regex.test(clean)) {
          throw new ForbiddenException(
            `Invalid phone number. Please provide a valid number with 7-15 digits (e.g. +919876543210)`,
          );
        }
      } else {
        // Standard URL platform — strip protocol-related issues before testing
        const testUrl = link.url.trim();
        if (!regex.test(testUrl)) {
          const platformLabel = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
          throw new ForbiddenException(
            `Invalid ${platformLabel} URL. Please provide a valid ${platformLabel} link.`,
          );
        }
      }
    }
  }
}
