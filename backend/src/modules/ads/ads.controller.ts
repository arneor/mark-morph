import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { AdsService } from "./ads.service";
import {
  CreateAdDto,
  UpdateAdDto,
  AdResponseDto,
  UploadResponseDto,
} from "./dto/ads.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { memoryStorage } from "multer";

@ApiTags("Ads")
@Controller("ads")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get("business/:businessId")
  @SkipThrottle()
  @ApiOperation({ summary: "Get all ads for a business" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiResponse({
    status: 200,
    description: "List of ads",
    type: [AdResponseDto],
  })
  async getAds(
    @Param("businessId") businessId: string,
    @CurrentUser("userId") userId: string,
  ) {
    const ads = await this.adsService.getAdsForBusiness(businessId, userId);
    return ads.map((ad) => ({
      id: ad.id.toString(),
      title: ad.title,
      description: ad.description,
      mediaUrl: ad.mediaUrl,
      mediaType: ad.mediaType,
      ctaUrl: ad.ctaUrl,
      duration: ad.duration,
      status: ad.status,
      views: ad.views,
      clicks: ad.clicks,
      createdAt: ad.createdAt,
    }));
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiOperation({ summary: "Upload media file (image/video)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "File uploaded",
    type: UploadResponseDto,
  })
  async uploadMedia(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.adsService.uploadMedia(file);
    return {
      success: true,
      ...result,
    };
  }

  @Post("business/:businessId")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiOperation({ summary: "Create new ad with optional file upload" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Ad created", type: AdResponseDto })
  async createAd(
    @Param("businessId") businessId: string,
    @CurrentUser("userId") userId: string,
    @Body() dto: CreateAdDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const ad = await this.adsService.createAd(businessId, userId, dto, file);
    return {
      id: ad.id.toString(),
      title: ad.title,
      mediaUrl: ad.mediaUrl,
      mediaType: ad.mediaType,
      ctaUrl: ad.ctaUrl,
      duration: ad.duration,
      status: ad.status,
      views: ad.views,
      clicks: ad.clicks,
    };
  }

  @Put("business/:businessId/:adId")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  @ApiOperation({ summary: "Update existing ad" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiParam({ name: "adId", description: "Ad ID" })
  @ApiResponse({ status: 200, description: "Ad updated", type: AdResponseDto })
  async updateAd(
    @Param("businessId") businessId: string,
    @Param("adId") adId: string,
    @CurrentUser("userId") userId: string,
    @Body() dto: UpdateAdDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const ad = await this.adsService.updateAd(
      businessId,
      adId,
      userId,
      dto,
      file,
    );
    return {
      id: ad.id.toString(),
      title: ad.title,
      mediaUrl: ad.mediaUrl,
      mediaType: ad.mediaType,
      ctaUrl: ad.ctaUrl,
      duration: ad.duration,
      status: ad.status,
      views: ad.views,
      clicks: ad.clicks,
    };
  }

  @Delete("business/:businessId/:adId")
  @ApiOperation({ summary: "Delete an ad" })
  @ApiParam({ name: "businessId", description: "Business ID" })
  @ApiParam({ name: "adId", description: "Ad ID" })
  @ApiResponse({ status: 204, description: "Ad deleted" })
  async deleteAd(
    @Param("businessId") businessId: string,
    @Param("adId") adId: string,
    @CurrentUser("userId") userId: string,
  ) {
    await this.adsService.deleteAd(businessId, adId, userId);
    return { success: true };
  }
}
