import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TrackInteractionDto {
  @ApiProperty({ description: "Ad ID", example: "507f1f77bcf86cd799439011" })
  @IsString()
  @IsNotEmpty()
  adId: string;

  @ApiProperty({
    description: "Business ID",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({
    description: "Interaction type",
    enum: ["view", "click", "LIKE", "SHARE", "GALLERY_EXPAND"],
  })
  @IsEnum(["view", "click", "LIKE", "SHARE", "GALLERY_EXPAND"])
  interactionType: string;

  @ApiProperty({ description: "User ID (optional)", required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: "Device MAC address", required: false })
  @IsString()
  @IsOptional()
  macAddress?: string;

  @ApiProperty({ description: "Device type", example: "mobile" })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiProperty({ description: "Session ID", required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    description: "User email (optional lead capture)",
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;
}

export class ConnectWifiDto {
  @ApiProperty({ description: "Business ID" })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: "Device MAC address", required: false })
  @IsString()
  @IsOptional()
  macAddress?: string;

  @ApiProperty({ description: "Device type", example: "mobile" })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiProperty({ description: "User email for lead capture", required: false })
  @IsString()
  @IsOptional()
  email?: string;
}

export class TrackResponseDto {
  @ApiProperty({ description: "Tracking success status" })
  success: boolean;

  @ApiProperty({ description: "CTA redirect URL (for click events)" })
  redirectUrl?: string;
}

export class AnalyticsSummaryDto {
  @ApiProperty({ description: "Total views" })
  totalViews: number;

  @ApiProperty({ description: "Total clicks" })
  totalClicks: number;

  @ApiProperty({ description: "Click-through rate" })
  ctr: number;

  @ApiProperty({ description: "Unique users" })
  uniqueUsers: number;

  @ApiProperty({ description: "Date range start" })
  startDate: Date;

  @ApiProperty({ description: "Date range end" })
  endDate: Date;
}
