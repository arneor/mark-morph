import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Offer, OfferDocument } from "./schemas/offer.schema";
import {
    CreateOfferDto,
    UpdateOfferDto,
    QueryNearbyOffersDto,
} from "./dto/offer.dto";
import { S3Service } from "../media/s3.service";

@Injectable()
export class OffersService {
    private readonly logger = new Logger(OffersService.name);

    constructor(
        @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
        private readonly s3Service: S3Service,
    ) { }

    /**
     * Create a new offer for a business
     */
    async create(
        businessId: string,
        businessName: string,
        businessUsername: string | undefined,
        industry: string | undefined,
        businessLogoUrl: string | undefined,
        dto: CreateOfferDto,
    ): Promise<OfferDocument> {
        const offerData: Record<string, unknown> = {
            ...dto,
            businessId: new Types.ObjectId(businessId),
            businessName,
            businessUsername: businessUsername || undefined,
            industry: industry || undefined,
            businessLogoUrl: businessLogoUrl || undefined,
            location: {
                type: "Point",
                coordinates: [dto.longitude, dto.latitude], // GeoJSON: [lng, lat]
            },
            validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
            validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        };

        // Remove flat lat/lng — stored as GeoJSON
        delete offerData.latitude;
        delete offerData.longitude;

        // Auto-calculate discount percentage if prices provided
        if (dto.originalPrice && dto.offerPrice && dto.originalPrice > 0) {
            offerData.discountPercentage = Math.round(
                ((dto.originalPrice - dto.offerPrice) / dto.originalPrice) * 100,
            );
        }

        const offer = new this.offerModel(offerData);
        const saved = await offer.save();
        this.logger.log(`Created offer ${saved._id} for business ${businessId}`);
        return saved;
    }

    /**
     * Update an offer (ownership-checked)
     */
    async update(
        offerId: string,
        businessId: string,
        dto: UpdateOfferDto,
    ): Promise<OfferDocument> {
        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException("Offer not found");
        }
        if (offer.businessId.toString() !== businessId) {
            throw new ForbiddenException("You can only update your own offers");
        }

        const updateData: Record<string, unknown> = { ...dto };

        // If lat/lng provided, update GeoJSON location
        if (dto.latitude !== undefined && dto.longitude !== undefined) {
            updateData.location = {
                type: "Point",
                coordinates: [dto.longitude, dto.latitude],
            };
        }
        delete updateData.latitude;
        delete updateData.longitude;

        // Convert date strings
        if (dto.validFrom) updateData.validFrom = new Date(dto.validFrom);
        if (dto.validUntil) updateData.validUntil = new Date(dto.validUntil);

        // Recalculate discount
        const origPrice = dto.originalPrice ?? offer.originalPrice;
        const offPrice = dto.offerPrice ?? offer.offerPrice;
        if (origPrice && offPrice && origPrice > 0) {
            updateData.discountPercentage = Math.round(
                ((origPrice - offPrice) / origPrice) * 100,
            );
        }

        Object.assign(offer, updateData);
        const saved = await offer.save();
        this.logger.log(`Updated offer ${offerId}`);
        return saved;
    }

    /**
     * Delete an offer (ownership-checked)
     */
    async delete(offerId: string, businessId: string): Promise<void> {
        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException("Offer not found");
        }
        if (offer.businessId.toString() !== businessId) {
            throw new ForbiddenException("You can only delete your own offers");
        }

        // Delete S3 banner if exists
        if (offer.bannerS3Key) {
            await this.s3Service.delete(offer.bannerS3Key);
        }

        await this.offerModel.deleteOne({ _id: offerId });
        this.logger.log(`Deleted offer ${offerId}`);
    }

    /**
     * Find all offers for a business (merchant view)
     */
    async findByBusiness(businessId: string): Promise<OfferDocument[]> {
        return this.offerModel
            .find({ businessId: new Types.ObjectId(businessId) })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find a single offer by ID
     */
    async findById(offerId: string): Promise<OfferDocument> {
        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException("Offer not found");
        }
        return offer;
    }

    /**
     * Find a single active offer by ID (public)
     */
    async findActiveById(offerId: string): Promise<OfferDocument> {
        const offer = await this.offerModel.findOne({
            _id: new Types.ObjectId(offerId),
            status: "active",
        });
        if (!offer) {
            throw new NotFoundException("Offer not found");
        }
        return offer;
    }

    /**
     * Geospatial proximity query for public /nearby endpoint.
     * Uses MongoDB $nearSphere with $maxDistance for 2dsphere queries.
     */
    async findNearby(query: QueryNearbyOffersDto): Promise<{
        offers: OfferDocument[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const {
            latitude,
            longitude,
            maxDistanceKm = 10,
            category,
            industry,
            search,
            page = 1,
            limit = 20,
            dateFrom,
            dateTo,
        } = query;

        const now = new Date();
        const maxDistanceMeters = maxDistanceKm * 1000;

        // Build filter
        const filter: Record<string, unknown> = {
            status: "active",
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: maxDistanceMeters,
                },
            },
        };

        // Only show offers that haven't expired
        filter.$or = [
            { validUntil: { $gte: now } },
            { validUntil: { $exists: false } },
            { validUntil: null },
        ];

        if (category) {
            filter.category = category;
        }

        if (industry) {
            filter.industry = industry;
        }

        if (dateFrom || dateTo) {
            const dateFilter: Record<string, Date> = {};
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);
            filter.validFrom = dateFilter;
        }

        // Text search requires a separate approach — $text cannot combine with $nearSphere
        // in the same query. We use a regex fallback for search.
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { title: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
                { tags: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        // $nearSphere automatically sorts by distance, so no explicit sort needed
        const [offers, total] = await Promise.all([
            this.offerModel.find(filter).skip(skip).limit(limit).exec(),
            this.offerModel.countDocuments({
                ...filter,
                // countDocuments doesn't support $nearSphere, replace with $geoWithin for count
                location: {
                    $geoWithin: {
                        $centerSphere: [
                            [longitude, latitude],
                            maxDistanceMeters / 6378100, // Convert to radians (Earth radius)
                        ],
                    },
                },
            }),
        ]);

        return {
            offers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Upload banner image for an offer
     */
    async uploadBanner(
        offerId: string,
        businessId: string,
        file: Express.Multer.File,
    ): Promise<{ url: string; key: string }> {
        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException("Offer not found");
        }
        if (offer.businessId.toString() !== businessId) {
            throw new ForbiddenException("You can only update your own offers");
        }

        // Delete old banner if exists
        if (offer.bannerS3Key) {
            await this.s3Service.delete(offer.bannerS3Key);
        }

        // Upload new banner
        const result = await this.s3Service.upload(
            file,
            "business",
            businessId,
            "offers-banner",
        );

        offer.bannerUrl = result.url;
        offer.bannerS3Key = result.key;
        await offer.save();

        return result;
    }
}
