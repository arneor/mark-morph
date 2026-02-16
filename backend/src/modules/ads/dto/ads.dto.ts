import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUrl,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateAdDto {
  @ApiProperty({ description: "Ad title", example: "Morning Special" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Ad description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Media URL (will be set by upload)",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @ApiProperty({
    description: "Media type",
    enum: ["image", "video"],
    default: "image",
  })
  @IsEnum(["image", "video"])
  @IsOptional()
  mediaType?: string;

  @ApiProperty({ description: "CTA URL (Google Review link)", required: false })
  @IsUrl()
  @IsOptional()
  ctaUrl?: string;

  @ApiProperty({ description: "Display duration in seconds", default: 5 })
  @IsNumber()
  @Min(1)
  @Max(60)
  @IsOptional()
  duration?: number;
}

export class UpdateAdDto extends PartialType(CreateAdDto) {
  @ApiProperty({
    description: "Ad status",
    enum: ["active", "paused", "archived"],
  })
  @IsEnum(["active", "paused", "archived"])
  @IsOptional()
  status?: string;
}

export class AdResponseDto {
  @ApiProperty({ description: "Ad ID" })
  id: string;

  @ApiProperty({ description: "Ad title" })
  title: string;

  @ApiProperty({ description: "Media URL" })
  mediaUrl: string;

  @ApiProperty({ description: "Media type" })
  mediaType: string;

  @ApiProperty({ description: "CTA URL" })
  ctaUrl?: string;

  @ApiProperty({ description: "Duration in seconds" })
  duration: number;

  @ApiProperty({ description: "Status" })
  status: string;

  @ApiProperty({ description: "Total views" })
  views: number;

  @ApiProperty({ description: "Total clicks" })
  clicks: number;

  @ApiProperty({ description: "Created timestamp" })
  createdAt: Date;
}

export class UploadResponseDto {
  @ApiProperty({ description: "Upload success status" })
  success: boolean;

  @ApiProperty({ description: "Uploaded file URL" })
  url: string;

  @ApiProperty({ description: "File type" })
  type: string;

  @ApiProperty({ description: "Original filename" })
  filename: string;
}
