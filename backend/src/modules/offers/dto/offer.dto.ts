import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsArray,
    IsDateString,
    Min,
    Max,
    IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { OFFER_CATEGORIES } from "../schemas/offer.schema";

export class CreateOfferDto {
    @ApiProperty({ description: "Offer title" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ description: "Detailed offer description" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: "Product category", enum: OFFER_CATEGORIES })
    @IsEnum(OFFER_CATEGORIES)
    category: string;

    @ApiPropertyOptional({ description: "Original price" })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    originalPrice?: number;

    @ApiPropertyOptional({ description: "Discounted price" })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offerPrice?: number;

    @ApiPropertyOptional({ description: "Discount percentage" })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    discountPercentage?: number;

    @ApiPropertyOptional({ description: "Currency code" })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ description: "Offer start date" })
    @IsOptional()
    @IsDateString()
    validFrom?: string;

    @ApiPropertyOptional({ description: "Offer end date" })
    @IsOptional()
    @IsDateString()
    validUntil?: string;

    @ApiProperty({ description: "Latitude of the offer location" })
    @IsNumber()
    @Type(() => Number)
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ description: "Longitude of the offer location" })
    @IsNumber()
    @Type(() => Number)
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiPropertyOptional({ description: "Human-readable address" })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: "Offer status",
        enum: ["active", "expired", "draft"],
    })
    @IsOptional()
    @IsEnum(["active", "expired", "draft"])
    status?: string;

    @ApiPropertyOptional({ description: "Search tags" })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ description: "Terms and conditions" })
    @IsOptional()
    @IsString()
    termsAndConditions?: string;

    @ApiPropertyOptional({ description: "Contact phone" })
    @IsOptional()
    @IsString()
    contactPhone?: string;

    @ApiPropertyOptional({ description: "Contact email" })
    @IsOptional()
    @IsString()
    contactEmail?: string;
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) { }

export class QueryNearbyOffersDto {
    @ApiProperty({ description: "User latitude" })
    @IsNumber()
    @Type(() => Number)
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ description: "User longitude" })
    @IsNumber()
    @Type(() => Number)
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiPropertyOptional({
        description: "Maximum distance in kilometers",
        default: 10,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0.1)
    @Max(200)
    maxDistanceKm?: number;

    @ApiPropertyOptional({ description: "Filter by category" })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: "Filter by industry" })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiPropertyOptional({ description: "Text search query" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: "Page number", default: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: "Results per page", default: 20 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({ description: "Filter offers valid from this date" })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ description: "Filter offers valid until this date" })
    @IsOptional()
    @IsDateString()
    dateTo?: string;
}
