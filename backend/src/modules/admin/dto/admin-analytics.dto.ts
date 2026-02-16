import { ApiProperty } from "@nestjs/swagger";

export class KpisDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  userGrowth: string;

  @ApiProperty()
  activeBusinesses: number;

  @ApiProperty()
  totalBusinesses: number;

  @ApiProperty()
  totalAdViews: number;

  @ApiProperty()
  totalClicks: number;

  @ApiProperty()
  ctr: string;

  @ApiProperty()
  googleReviewsTriggered: number;
}

export class HeatMapPointDto {
  @ApiProperty()
  hour: number;

  @ApiProperty()
  count: number;
}

export class BusinessStatsDto {
  @ApiProperty()
  views: number;

  @ApiProperty()
  clicks: number;

  @ApiProperty()
  reviewsTriggered: number;
}

export class BusinessAnalyticsItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  totalConnections: number;

  @ApiProperty()
  activeSessions: number;

  @ApiProperty()
  loyaltyRate: string;

  @ApiProperty()
  stats: BusinessStatsDto;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: KpisDto })
  kpis: KpisDto;

  @ApiProperty({ type: [HeatMapPointDto] })
  heatMap: HeatMapPointDto[];

  @ApiProperty({ type: [BusinessAnalyticsItemDto] })
  businesses: BusinessAnalyticsItemDto[];
}
