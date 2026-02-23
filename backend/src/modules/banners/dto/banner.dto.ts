import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateBannerDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    accentColor?: string;

    @IsOptional()
    @IsString()
    linkUrl?: string;

    @IsOptional()
    @IsIn(['internal', 'external', 'category'])
    linkType?: string;

    @IsOptional()
    @IsNumber()
    position?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) { }
