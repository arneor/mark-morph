import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminJwtAuthGuard } from "./guards/admin-jwt-auth.guard";
import {
  AdminRequestOtpDto,
  AdminVerifyOtpDto,
  AdminAuthResponseDto,
  OtpRequestResponseDto,
  AdminStatsDto,
  BusinessListItemDto,
  BusinessActionDto,
} from "./dto/admin.dto";
import { Types } from "mongoose";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Request OTP for admin login
   * POST /api/admin/request-otp
   */
  @Post("request-otp")
  @HttpCode(HttpStatus.OK)
  async requestOtp(
    @Body() dto: AdminRequestOtpDto,
    @Request() req: any,
  ): Promise<OtpRequestResponseDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.adminService.requestOtp(dto, ipAddress);
  }

  /**
   * Verify OTP and login
   * POST /api/admin/verify-otp
   */
  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: AdminVerifyOtpDto,
    @Request() req: any,
  ): Promise<AdminAuthResponseDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.adminService.verifyOtp(dto, ipAddress, userAgent);
  }

  /**
   * Get current admin info
   * GET /api/admin/me
   */
  @Get("me")
  @UseGuards(AdminJwtAuthGuard)
  async getMe(@Request() req: any) {
    return {
      adminId: req.user._id.toString(),
      email: req.user.email,
      role: req.user.role,
    };
  }

  /**
   * Get platform statistics
   * GET /api/admin/stats
   */
  @Get("stats")
  @UseGuards(AdminJwtAuthGuard)
  async getStats(): Promise<AdminStatsDto> {
    return this.adminService.getStats();
  }

  /**
   * Get all businesses
   * GET /api/admin/businesses
   */
  @Get("businesses")
  @UseGuards(AdminJwtAuthGuard)
  async getBusinesses(): Promise<BusinessListItemDto[]> {
    return this.adminService.getAllBusinesses();
  }

  /**
   * Get pending approval businesses
   * GET /api/admin/businesses/pending
   */
  @Get("businesses/pending")
  @UseGuards(AdminJwtAuthGuard)
  async getPendingBusinesses(): Promise<BusinessListItemDto[]> {
    return this.adminService.getPendingBusinesses();
  }

  /**
   * Activate a business
   * PUT /api/admin/businesses/:id/activate
   */
  @Put("businesses/:id/activate")
  @UseGuards(AdminJwtAuthGuard)
  async activateBusiness(
    @Param("id") businessId: string,
    @Request() req: any,
  ): Promise<BusinessListItemDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.adminService.activateBusiness(
      businessId,
      new Types.ObjectId(req.user._id),
      req.user.email,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Reject a business
   * PUT /api/admin/businesses/:id/reject
   */
  @Put("businesses/:id/reject")
  @UseGuards(AdminJwtAuthGuard)
  async rejectBusiness(
    @Param("id") businessId: string,
    @Body() dto: BusinessActionDto,
    @Request() req: any,
  ): Promise<BusinessListItemDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.adminService.rejectBusiness(
      businessId,
      dto,
      new Types.ObjectId(req.user._id),
      req.user.email,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Suspend a business
   * PUT /api/admin/businesses/:id/suspend
   */
  @Put("businesses/:id/suspend")
  @UseGuards(AdminJwtAuthGuard)
  async suspendBusiness(
    @Param("id") businessId: string,
    @Body() dto: BusinessActionDto,
    @Request() req: any,
  ): Promise<BusinessListItemDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.adminService.suspendBusiness(
      businessId,
      dto,
      new Types.ObjectId(req.user._id),
      req.user.email,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Get access logs for a business
   * GET /api/admin/businesses/:id/access-logs
   */
  @Get("businesses/:id/access-logs")
  @UseGuards(AdminJwtAuthGuard)
  async getBusinessAccessLogs(@Param("id") businessId: string) {
    return this.adminService.getBusinessAccessLogs(businessId);
  }

  /**
   * Get total connection count
   * GET /api/admin/connections/count
   */
  @Get("connections/count")
  @UseGuards(AdminJwtAuthGuard)
  async getConnectionCount() {
    const totalConnections = await this.adminService.getTotalConnectionCount();
    return { totalConnections };
  }

  /**
   * Get detailed business insights
   * GET /api/admin/businesses/:id/details
   */
  @Get("businesses/:id/details")
  @UseGuards(AdminJwtAuthGuard)
  async getBusinessDetails(@Param("id") businessId: string): Promise<any> {
    return this.adminService.getBusinessDetails(businessId);
  }

  /**
   * Get granular interaction details for a specific ad
   * GET /api/admin/ads/:id/interactions
   */
  @Get("ads/:id/interactions")
  @UseGuards(AdminJwtAuthGuard)
  async getAdInteractionDetails(@Param("id") adId: string) {
    return this.adminService.getAdInteractionDetails(adId);
  }
}
