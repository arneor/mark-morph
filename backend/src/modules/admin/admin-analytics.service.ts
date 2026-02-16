import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Business,
  BusinessDocument,
} from "../business/schemas/business.schema";
import { WifiUser, WifiUserDocument } from "../splash/schemas/wifi-user.schema";
import {
  AnalyticsLog,
  AnalyticsLogDocument,
} from "../analytics/schemas/analytics-log.schema";
import {
  AdminDashboardResponseDto,
  BusinessAnalyticsItemDto,
  KpisDto,
} from "./dto/admin-analytics.dto";

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  // In-memory cache
  private cache: {
    data: AdminDashboardResponseDto | null;
    lastUpdated: number;
  } = { data: null, lastUpdated: 0 };

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(WifiUser.name) private wifiUserModel: Model<WifiUserDocument>,
    @InjectModel(AnalyticsLog.name)
    private analyticsModel: Model<AnalyticsLogDocument>,
  ) {}

  /**
   * Get "God-View" Dashboard Data
   */
  async getDashboardAnalytics(): Promise<AdminDashboardResponseDto> {
    // Check cache
    const now = Date.now();
    if (this.cache.data && now - this.cache.lastUpdated < this.CACHE_TTL) {
      this.logger.log("Serving dashboard analytics from storage cache");
      return this.cache.data;
    }

    this.logger.log("Generating fresh dashboard analytics...");
    const start = Date.now();

    const [kpis, businesses, heatMap] = await Promise.all([
      this.getGlobalKpis(),
      this.getBusinessDrilldown(),
      this.getPeakHourAnalysis(),
    ]);

    const response: AdminDashboardResponseDto = {
      kpis,
      businesses,
      heatMap,
    };

    // Update cache
    this.cache = {
      data: response,
      lastUpdated: now,
    };

    this.logger.log(`Analytics generated in ${Date.now() - start}ms`);
    return response;
  }

  /**
   * Get Time Series Trends (Last 7 Days)
   */
  async getTrends(): Promise<
    { date: string; views: number; connections: number }[]
  > {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trends = await this.analyticsModel.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          interactionType: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          views: {
            $sum: { $cond: [{ $eq: ["$interactionType", "view"] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$interactionType", "click"] }, 1, 0] },
          },
          // For connections, we need to join or query wifi users similarly.
          // For now, let's use clicks as key engagement metric for trends
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trends.map((t) => ({
      date: t._id,
      views: t.views,
      connections: t.clicks, // Using clicks as proxy for engagement in this specific graph
    }));
  }

  /**
   * A. Global Network KPIs
   */
  private async getGlobalKpis(): Promise<KpisDto> {
    const [totalUsers, totalBusinesses, activeBusinesses, analyticsStats] =
      await Promise.all([
        this.wifiUserModel.countDocuments(),
        this.businessModel.countDocuments(),
        this.businessModel.countDocuments({ status: "active" }),
        this.analyticsModel.aggregate([
          {
            $group: {
              _id: null,
              totalViews: {
                $sum: { $cond: [{ $eq: ["$interactionType", "view"] }, 1, 0] },
              },
              totalClicks: {
                $sum: { $cond: [{ $eq: ["$interactionType", "click"] }, 1, 0] },
              },
            },
          },
        ]),
      ]);

    const stats = analyticsStats[0] || { totalViews: 0, totalClicks: 0 };
    const ctr =
      stats.totalViews > 0
        ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) + "%"
        : "0%";

    // Growth approximation (mock for now, or could compare vs last month)
    const userGrowth = "+12%";

    return {
      totalUsers,
      userGrowth,
      totalBusinesses,
      activeBusinesses,
      totalAdViews: stats.totalViews,
      totalClicks: stats.totalClicks,
      ctr,
      googleReviewsTriggered: Math.floor(stats.totalClicks * 0.4), // Estimate based on business conversion
    };
  }

  /**
   * B. Business-Specific Intelligence (Leaderboard)
   */
  private async getBusinessDrilldown(): Promise<BusinessAnalyticsItemDto[]> {
    // We need to aggregate per business
    // This pipeline joins Business -> WifiUser (connections) -> Analytics (views/clicks)

    const businesses = await this.businessModel.aggregate([
      {
        $lookup: {
          from: "wifi_users",
          localField: "_id",
          foreignField: "businessId",
          as: "connections",
        },
      },
      {
        $lookup: {
          from: "analytics_logs",
          localField: "_id",
          foreignField: "businessId",
          as: "interactions",
        },
      },
      {
        $project: {
          name: "$businessName",
          location: { $ifNull: ["$location", "Unknown"] },
          totalConnections: { $size: "$connections" },
          wifiUsers: "$connections", // Keep for loyalty calc

          views: {
            $size: {
              $filter: {
                input: "$interactions",
                as: "i",
                cond: { $eq: ["$$i.interactionType", "view"] },
              },
            },
          },
          clicks: {
            $size: {
              $filter: {
                input: "$interactions",
                as: "i",
                cond: { $eq: ["$$i.interactionType", "click"] },
              },
            },
          },
        },
      },
      { $sort: { totalConnections: -1 } },
      { $limit: 20 }, // Top 20 for performance
    ]);

    return businesses.map((b) => {
      // Loyalty Rate: % of users with > 1 visit
      const repeatUsers = b.wifiUsers.filter(
        (u: any) => u.visitCount > 1,
      ).length;
      const totalUsers = b.wifiUsers.length;
      const loyaltyRate =
        totalUsers > 0
          ? Math.round((repeatUsers / totalUsers) * 100) + "%"
          : "0%";

      // Active Sessions (Approx based on recent connections - e.g. last 30 mins)
      // Ideally strictly filtered in DB, but map logic is fine for "God View" snapshot
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      const activeSessions = b.wifiUsers.filter(
        (u: any) => new Date(u.updatedAt) > thirtyMinsAgo,
      ).length;

      return {
        id: b._id.toString(),
        name: b.name,
        location: b.location,
        totalConnections: b.totalConnections,
        activeSessions,
        loyaltyRate,
        stats: {
          views: b.views,
          clicks: b.clicks,
          reviewsTriggered: Math.round(b.clicks * 0.3), // Estimate
        },
      };
    });
  }

  /**
   * C. Peak Hour Analysis (Heatmap)
   */
  private async getPeakHourAnalysis(): Promise<
    { hour: number; count: number }[]
  > {
    // Aggregate all analytics logs by hour of day
    const peakHours = await this.analyticsModel.aggregate([
      {
        $project: {
          hour: { $hour: "$timestamp" }, // Extract hour from timestamp
        },
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing hours with 0
    const result = [];
    const hourMap = new Map(peakHours.map((p) => [p._id, p.count]));

    for (let i = 0; i < 24; i++) {
      result.push({
        hour: i,
        count: hourMap.get(i) || 0,
      });
    }

    return result;
  }
}
