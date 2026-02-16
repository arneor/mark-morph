import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminJwtAuthGuard } from "./guards/admin-jwt-auth.guard";
import {
  AdminDashboardResponseDto,
  BusinessAnalyticsItemDto,
  KpisDto,
} from "./dto/admin-analytics.dto";

@ApiTags("Admin Analytics")
@Controller("admin/analytics")
@UseGuards(AdminJwtAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get global network KPIs for top-row cards" })
  @ApiResponse({
    status: 200,
    description: "Return global KPIs",
    type: KpisDto,
  })
  async getSummary() {
    const data = await this.analyticsService.getDashboardAnalytics();
    return data.kpis;
  }

  @Get("business-drilldown")
  @ApiOperation({ summary: "Get detailed business analytics list" })
  @ApiResponse({
    status: 200,
    description: "Return business list with deep stats",
    type: [BusinessAnalyticsItemDto],
  })
  async getBusinessDrilldown() {
    const data = await this.analyticsService.getDashboardAnalytics();
    return data.businesses;
  }

  @Get("trends")
  @ApiOperation({ summary: "Get time-series growth trends (last 7 days)" })
  @ApiResponse({ status: 200, description: "Return 7-day trend data" })
  async getTrends() {
    return this.analyticsService.getTrends();
  }

  @Get("dashboard")
  @ApiOperation({ summary: 'Get full "God-View" dashboard data structure' })
  @ApiResponse({
    status: 200,
    description: "Return full dashboard payload",
    type: AdminDashboardResponseDto,
  })
  async getDashboard() {
    return this.analyticsService.getDashboardAnalytics();
  }
}
