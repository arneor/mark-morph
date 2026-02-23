import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OffersService } from "./offers.service";
import {
    CreateOfferDto,
    UpdateOfferDto,
    QueryNearbyOffersDto,
} from "./dto/offer.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { BusinessService } from "../business/business.service";

@ApiTags("Offers")
@Controller("offers")
export class OffersController {
    constructor(
        private readonly offersService: OffersService,
        private readonly businessService: BusinessService,
    ) { }

    // ─── PUBLIC ENDPOINTS (No Auth) ─────────────────────────

    @Get("nearby")
    @ApiOperation({ summary: "Find nearby active offers (public)" })
    async findNearby(@Query() query: QueryNearbyOffersDto) {
        return this.offersService.findNearby(query);
    }

    @Get("public/:id")
    @ApiOperation({ summary: "Get a single active offer (public)" })
    async getPublicOffer(@Param("id") id: string) {
        return this.offersService.findActiveById(id);
    }

    // ─── AUTHENTICATED ENDPOINTS (Merchant) ─────────────────

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Create a new offer" })
    async create(
        @CurrentUser("userId") userId: string,
        @Body() dto: CreateOfferDto,
    ) {
        // Find the business owned by this user
        const business = await this.businessService.findByOwnerId(userId);
        if (!business) {
            throw new Error("No business found for this user");
        }

        return this.offersService.create(
            business._id.toString(),
            business.businessName,
            business.username,
            business.industryType,
            business.logoUrl,
            dto,
        );
    }

    @Get("my")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "List my offers" })
    async getMyOffers(@CurrentUser("userId") userId: string) {
        const business = await this.businessService.findByOwnerId(userId);
        if (!business) {
            return [];
        }
        return this.offersService.findByBusiness(business._id.toString());
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get offer by ID (authenticated)" })
    async getById(@Param("id") id: string) {
        return this.offersService.findById(id);
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update an offer" })
    async update(
        @Param("id") id: string,
        @CurrentUser("userId") userId: string,
        @Body() dto: UpdateOfferDto,
    ) {
        const business = await this.businessService.findByOwnerId(userId);
        if (!business) {
            throw new Error("No business found for this user");
        }
        return this.offersService.update(id, business._id.toString(), dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete an offer" })
    async remove(
        @Param("id") id: string,
        @CurrentUser("userId") userId: string,
    ) {
        const business = await this.businessService.findByOwnerId(userId);
        if (!business) {
            throw new Error("No business found for this user");
        }
        await this.offersService.delete(id, business._id.toString());
        return { success: true, message: "Offer deleted successfully" };
    }

    @Post(":id/upload-banner")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor("file"))
    @ApiOperation({ summary: "Upload offer banner image" })
    async uploadBanner(
        @Param("id") id: string,
        @CurrentUser("userId") userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const business = await this.businessService.findByOwnerId(userId);
        if (!business) {
            throw new Error("No business found for this user");
        }
        return this.offersService.uploadBanner(
            id,
            business._id.toString(),
            file,
        );
    }
}
