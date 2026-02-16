import { Controller, Post, Get, Body, Param, Query, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Request } from "express";
import { AnalyticsService } from "./analytics.service";
import {
  TrackInteractionDto,
  ConnectWifiDto,
  TrackResponseDto,
  AnalyticsSummaryDto,
} from "./dto/analytics.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("track")
  @SkipThrottle() // No rate limiting for analytics - needs to be fast
  @ApiOperation({
    summary: "Track ad interaction",
    description:
      "Track view or click interaction from captive portal. Non-blocking for optimal UX.",
  })
  @ApiResponse({
    status: 200,
    description: "Interaction tracked",
    type: TrackResponseDto,
  })
  async trackInteraction(
    @Body() dto: TrackInteractionDto,
    @Req() req: Request,
  ): Promise<TrackResponseDto> {
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();
    const userAgent = req.headers["user-agent"];

    return this.analyticsService.trackInteraction(dto, ipAddress, userAgent);
  }

  @Post("connect")
  @SkipThrottle()
  @ApiOperation({
    summary: "WiFi connect action",
    description:
      "Log connection and return CTA redirect URL (Google Review deep-link)",
  })
  @ApiResponse({
    status: 200,
    description: "Connection logged, redirect URL returned",
    schema: {
      properties: {
        success: { type: "boolean" },
        redirectUrl: {
          type: "string",
          example: "https://g.page/r/abc123/review",
        },
      },
    },
  })
  async connectWifi(@Body() dto: ConnectWifiDto, @Req() req: Request) {
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();
    const userAgent = req.headers["user-agent"];

    return this.analyticsService.handleWifiConnect(dto, ipAddress, userAgent);
  }

  @Get("summary/:businessId")
  @SkipThrottle()
  @ApiOperation({ summary: "Get analytics summary for a business" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiQuery({
    name: "startDate",
    description: "Start date (ISO)",
    required: false,
  })
  @ApiQuery({ name: "endDate", description: "End date (ISO)", required: false })
  @ApiResponse({
    status: 200,
    description: "Analytics summary",
    type: AnalyticsSummaryDto,
  })
  async getAnalyticsSummary(
    @Param("businessId") businessId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<AnalyticsSummaryDto> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getAnalyticsSummary(businessId, start, end);
  }

  @Get("daily/:businessId")
  @SkipThrottle()
  @ApiOperation({ summary: "Get daily analytics for charts" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiQuery({ name: "days", description: "Number of days", required: false })
  @ApiResponse({
    status: 200,
    description: "Daily analytics data",
    schema: {
      type: "array",
      items: {
        properties: {
          date: { type: "string" },
          views: { type: "number" },
          clicks: { type: "number" },
        },
      },
    },
  })
  async getDailyAnalytics(
    @Param("businessId") businessId: string,
    @Query("days") days?: number,
  ) {
    return this.analyticsService.getDailyAnalytics(businessId, days || 7);
  }
}
