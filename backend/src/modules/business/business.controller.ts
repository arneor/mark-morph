import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { BusinessService } from "./business.service";
import {
  CreateBusinessDto,
  UpdateTreeProfileDto,
  UpdateWifiProfileDto,
  DashboardStatsDto,
} from "./dto/business.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Business")
@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) { }

  @Post("register")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Register new business",
    description:
      "Create a new business profile for the authenticated user. Business will be in pending_approval status.",
  })
  @ApiResponse({
    status: 201,
    description: "Business created successfully (pending approval)",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async register(
    @CurrentUser("userId") userId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    const business = await this.businessService.create(userId, dto);
    return {
      id: business._id,
      businessName: business.businessName,
      ownerId: business.ownerId,
      location: business.location,
      contactEmail: business.contactEmail,
      description: business.description,
      status: business.status,
      isActive: business.isActive,
      onboardingCompleted: business.onboardingCompleted,
      username: business.username,
      message: "Business registered successfully. Pending admin approval.",
    };
  }

  @Get("check-username/:username")
  @SkipThrottle()
  @ApiOperation({ summary: "Check if username is available" })
  @ApiParam({ name: "username", description: "Username to check" })
  @ApiResponse({ status: 200, description: "Returns availability status" })
  async checkUsername(@Param("username") username: string) {
    const isAvailable = await this.businessService.checkUsernameAvailability(
      username,
    );
    return { available: isAvailable };
  }

  @Get("u/:username")
  @SkipThrottle()
  @ApiOperation({ summary: "Get public business profile by username" })
  @ApiParam({
    name: "username",
    description: "Unique username of the business",
  })
  @ApiResponse({ status: 200, description: "Business profile data" })
  @ApiResponse({ status: 404, description: "Business not found" })
  async getPublicProfileByUsername(@Param("username") username: string) {
    const merged =
      await this.businessService.getFullBusinessByUsername(username);

    return {
      id: merged.id,
      businessName: merged.businessName,
      username: merged.username,
      location: merged.location,
      category: merged.category,
      logoUrl: merged.logoUrl,
      primaryColor: merged.primaryColor,
      description: merged.description,
      // Tree profile data
      tagline: merged.tagline,
      sectionTitle: merged.sectionTitle,
      linksTitle: merged.linksTitle,
      profileImage: merged.profileImage,
      bannerImage: merged.bannerImage,
      openingHours: merged.openingHours,
      theme: merged.theme,
      customLinks: merged.customLinks,
      socialLinks: merged.socialLinks,
      gallery: (merged.gallery || []).slice(0, 12),
      totalGalleryImages: (merged.gallery || []).length,
      categories: merged.categories,
      catalogItems: merged.catalogItems,
      reviews: merged.reviews,
      // WiFi ads (active only)
      ads: (merged.ads || []).filter((ad: any) => ad.status === "active"),
      createdAt: merged.createdAt,
    };
  }

  @Get("u/:username/gallery")
  @SkipThrottle()
  @ApiOperation({ summary: "Get paginated gallery images by username" })
  @ApiParam({ name: "username", description: "Business username" })
  @ApiResponse({ status: 200, description: "Gallery images with pagination metadata" })
  async getGallery(
    @Param("username") username: string,
    @Query("page") pageString?: string,
    @Query("limit") limitString?: string,
  ) {
    const page = parseInt(pageString || "1", 10) || 1;
    const limit = parseInt(limitString || "20", 10) || 20;

    return this.businessService.getGalleryByUsername(username, page, limit);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user business",
    description: "Get the business profile for the authenticated user",
  })
  @ApiResponse({ status: 200, description: "Business profile" })
  @ApiResponse({ status: 404, description: "No business found" })
  async getMyBusiness(@CurrentUser("userId") userId: string) {
    const merged = await this.businessService.getFullBusinessByOwnerId(userId);

    if (!merged) {
      return { business: null };
    }

    return {
      id: merged.id,
      businessName: merged.businessName,
      location: merged.location,
      contactEmail: merged.contactEmail,
      category: merged.category,
      logoUrl: merged.logoUrl,
      primaryColor: merged.primaryColor,
      description: merged.description,
      profileType: merged.profileType,
      status: merged.status,
      isActive: merged.isActive,
      onboardingCompleted: merged.onboardingCompleted,
      rejectionReason: merged.rejectionReason,
      suspensionReason: merged.suspensionReason,
      // WiFi profile fields
      wifiSsid: merged.wifiSsid,
      googleReviewUrl: merged.googleReviewUrl,
      welcomeTitle: merged.welcomeTitle,
      ctaButtonText: merged.ctaButtonText,
      ctaButtonUrl: merged.ctaButtonUrl,
      showWelcomeBanner: merged.showWelcomeBanner,
      adsCount: (merged.ads || []).length,
      // Tree profile fields
      tagline: merged.tagline,
      sectionTitle: merged.sectionTitle,
      linksTitle: merged.linksTitle,
      profileImage: merged.profileImage,
      bannerImage: merged.bannerImage,
      openingHours: merged.openingHours,
      theme: merged.theme,
      customLinks: merged.customLinks,
      socialLinks: merged.socialLinks,
      banners: merged.banners,
      gallery: merged.gallery,
      categories: merged.categories,
      catalogItems: merged.catalogItems,
      reviews: merged.reviews,
    };
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get dashboard statistics",
    description: "Get analytics and statistics for the business dashboard",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics",
    type: DashboardStatsDto,
  })
  async getDashboard(@CurrentUser() user: any) {
    if (!user.businessId) {
      return {
        totalConnections: 0,
        activeUsers: 0,
        totalAdsServed: 0,
        totalViews: 0,
        totalClicks: 0,
        ctr: 0,
        revenue: 0,
        connectionsHistory: [],
      };
    }

    return this.businessService.getDashboardStats(user.businessId, user.userId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get business by ID" })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({ status: 200, description: "Business profile" })
  @ApiResponse({ status: 403, description: "Access denied" })
  @ApiResponse({ status: 404, description: "Business not found" })
  async getById(@Param("id") id: string, @CurrentUser() user: any) {
    // First check ownership with core business doc
    const business = await this.businessService.findById(id);
    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";
    const isOwner = business.ownerId.toString() === user.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You do not have permission to access this business",
      );
    }

    // Now fetch merged data
    const merged = await this.businessService.getFullBusiness(id);

    return {
      id: merged.id,
      businessName: merged.businessName,
      location: merged.location,
      contactEmail: merged.contactEmail,
      category: merged.category,
      logoUrl: merged.logoUrl,
      primaryColor: merged.primaryColor,
      description: merged.description,
      profileType: merged.profileType,
      status: merged.status,
      isActive: merged.isActive,
      // WiFi profile
      wifiSsid: merged.wifiSsid,
      googleReviewUrl: merged.googleReviewUrl,
      welcomeTitle: merged.welcomeTitle,
      ctaButtonText: merged.ctaButtonText,
      ctaButtonUrl: merged.ctaButtonUrl,
      showWelcomeBanner: merged.showWelcomeBanner,
      adsCount: (merged.ads || []).length,
      ads: merged.ads,
      // Tree profile
      tagline: merged.tagline,
      sectionTitle: merged.sectionTitle,
      linksTitle: merged.linksTitle,
      profileImage: merged.profileImage,
      bannerImage: merged.bannerImage,
      openingHours: merged.openingHours,
      theme: merged.theme,
      customLinks: merged.customLinks,
      socialLinks: merged.socialLinks,
      banners: merged.banners,
      gallery: merged.gallery,
      categories: merged.categories,
      catalogItems: merged.catalogItems,
      reviews: merged.reviews,
    };
  }

  // ---- Update Endpoints ----

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary:
      "Update business profile (backward-compatible, accepts all fields)",
  })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({ status: 200, description: "Business updated" })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() body: Record<string, any>,
  ) {
    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";

    // Core business fields
    const businessFields = [
      "businessName",
      "username",
      "location",
      "category",
      "description",
      "contactEmail",
      "contactPhone",
      "primaryColor",
      "profileType",
      "isActive",
      "onboardingCompleted",
    ];

    // Tree profile fields
    const treeFields = [
      "theme",
      "tagline",
      "sectionTitle",
      "linksTitle",
      "profileImage",
      "bannerImage",
      "openingHours",
      "socialLinks",
      "customLinks",
      "banners",
      "gallery",
      "categories",
      "catalogItems",
      "reviews",
    ];

    // WiFi profile fields
    const wifiFields = [
      "wifiSsid",
      "googleReviewUrl",
      "welcomeTitle",
      "ctaButtonText",
      "ctaButtonUrl",
      "showWelcomeBanner",
      "operatingHours",
      "ads",
    ];

    // Fields that go to BOTH tree and wifi profiles
    const sharedProfileFields = ["logoUrl"];

    // Split incoming body into the three DTOs
    const businessDto: Record<string, any> = {};
    const treeDto: Record<string, any> = {};
    const wifiDto: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (businessFields.includes(key)) {
        businessDto[key] = value;
      } else if (treeFields.includes(key)) {
        treeDto[key] = value;
      } else if (wifiFields.includes(key)) {
        wifiDto[key] = value;
      }
      // logoUrl goes to both profiles
      if (sharedProfileFields.includes(key)) {
        treeDto[key] = value;
        wifiDto[key] = value;
      }
    }

    // Update core business (always)
    await this.businessService.update(
      id,
      user.userId,
      businessDto as any,
      isAdmin,
    );

    // Update tree profile if any tree fields were sent
    if (Object.keys(treeDto).length > 0) {
      await this.businessService.updateTreeProfile(
        id,
        user.userId,
        treeDto as any,
        isAdmin,
      );
    }

    // Update wifi profile if any wifi fields were sent
    if (Object.keys(wifiDto).length > 0) {
      await this.businessService.updateWifiProfile(
        id,
        user.userId,
        wifiDto as any,
        isAdmin,
      );
    }

    // Return merged data for backward compatibility
    const merged = await this.businessService.getFullBusiness(id);
    return {
      id: merged.id,
      businessName: merged.businessName,
      location: merged.location,
      contactEmail: merged.contactEmail,
      status: merged.status,
      isActive: merged.isActive,
      onboardingCompleted: merged.onboardingCompleted,
      // Include wifi/tree fields so frontend sees updated values
      googleReviewUrl: merged.googleReviewUrl,
      ctaButtonText: merged.ctaButtonText,
      showWelcomeBanner: merged.showWelcomeBanner,
      ads: merged.ads,
      tagline: merged.tagline,
      theme: merged.theme,
    };
  }

  @Put(":id/tree-profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update tree profile" })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({ status: 200, description: "Tree profile updated" })
  async updateTreeProfile(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTreeProfileDto,
  ) {
    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";
    const treeProfile = await this.businessService.updateTreeProfile(
      id,
      user.userId,
      dto,
      isAdmin,
    );

    return {
      businessId: id,
      tagline: treeProfile.tagline,
      sectionTitle: treeProfile.sectionTitle,
      linksTitle: treeProfile.linksTitle,
      profileImage: treeProfile.profileImage,
      bannerImage: treeProfile.bannerImage,
      theme: treeProfile.theme,
      message: "Tree profile updated successfully",
    };
  }

  @Put(":id/wifi-profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update WiFi profile" })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({ status: 200, description: "WiFi profile updated" })
  async updateWifiProfile(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateWifiProfileDto,
  ) {
    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";
    const wifiProfile = await this.businessService.updateWifiProfile(
      id,
      user.userId,
      dto,
      isAdmin,
    );

    return {
      businessId: id,
      wifiSsid: wifiProfile.wifiSsid,
      googleReviewUrl: wifiProfile.googleReviewUrl,
      welcomeTitle: wifiProfile.welcomeTitle,
      adsCount: wifiProfile.ads.length,
      message: "WiFi profile updated successfully",
    };
  }

  // ---- Upload ----

  @Post(":id/upload")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload media (logo, banners, gallery)" })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({
    status: 201,
    description: "File uploaded and profile updated",
  })
  async upload(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body("placement") placement: string,
  ) {
    if (!file) {
      throw new ForbiddenException("No file uploaded");
    }

    const validPlacements = [
      "branding",
      "banner",
      "gallery",
      "tree-profile-banners",
      "tree-profile-gallery",
      "tree-profile-catalog",
      "tree-profile-profile",
    ];
    if (!placement || !validPlacements.includes(placement)) {
      placement = "gallery";
    }

    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";
    return this.businessService.uploadMedia(
      id,
      file,
      placement,
      user.userId,
      isAdmin,
    );
  }

  // ---- Stats ----

  @Get(":id/stats")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get business dashboard stats" })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics",
    type: DashboardStatsDto,
  })
  async getStats(@Param("id") id: string, @CurrentUser() user: any) {
    const isAdmin =
      user.type === "admin" ||
      user.role === "super_admin" ||
      user.role === "admin";
    return this.businessService.getDashboardStats(id, user.userId, isAdmin);
  }

  @Get(":id/access-logs")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get admin access logs for business",
    description:
      "Business owners can see when admins accessed their data (transparency)",
  })
  @ApiParam({ name: "id", description: "Business ID" })
  @ApiResponse({ status: 200, description: "Access logs" })
  async getAccessLogs(@Param("id") id: string, @CurrentUser() user: any) {
    const business = await this.businessService.findById(id);
    if (business.ownerId.toString() !== user.userId) {
      throw new ForbiddenException(
        "You can only view access logs for your own business",
      );
    }

    return this.businessService.getAdminAccessLogs(id);
  }
}
