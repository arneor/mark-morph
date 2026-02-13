import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from '../business/schemas/business.schema';
import { WifiProfile, WifiProfileDocument, Ad } from '../business/schemas/wifi-profile.schema';
import { CreateAdDto, UpdateAdDto } from './dto/ads.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    private readonly uploadDir: string;

    constructor(
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
        @InjectModel(WifiProfile.name) private wifiProfileModel: Model<WifiProfileDocument>,
        private configService: ConfigService,
    ) {
        this.uploadDir = this.configService.get<string>('UPLOAD_DEST') || './uploads';

        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Find or create a wifi profile for the business
     */
    private async findOrCreateWifiProfile(businessId: string): Promise<WifiProfileDocument> {
        let profile = await this.wifiProfileModel.findOne({ businessId: new Types.ObjectId(businessId) });
        if (!profile) {
            profile = await this.wifiProfileModel.create({ businessId: new Types.ObjectId(businessId) });
        }
        return profile;
    }

    /**
     * Get all ads for a business
     */
    async getAdsForBusiness(businessId: string, ownerId: string): Promise<Ad[]> {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check ownership
        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to view these ads');
        }

        const wifiProfile = await this.findOrCreateWifiProfile(businessId);
        return wifiProfile.ads;
    }

    /**
     * Create a new ad for a business
     */
    async createAd(
        businessId: string,
        ownerId: string,
        dto: CreateAdDto,
        file?: Express.Multer.File
    ): Promise<Ad> {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to add ads to this business');
        }

        // Handle file upload
        let mediaUrl = dto.mediaUrl;
        let mediaType = dto.mediaType || 'image';

        if (file) {
            const uploadResult = await this.saveUploadedFile(file);
            mediaUrl = uploadResult.url;
            mediaType = uploadResult.type;
        }

        if (!mediaUrl) {
            throw new BadRequestException('Media file or URL is required');
        }

        const wifiProfile = await this.findOrCreateWifiProfile(businessId);

        const newAd: any = {
            id: new Types.ObjectId(),
            title: dto.title,
            description: dto.description,
            mediaUrl,
            mediaType,
            ctaUrl: dto.ctaUrl || wifiProfile.googleReviewUrl,
            duration: dto.duration || 5,
            status: 'active',
            views: 0,
            clicks: 0,
            createdAt: new Date(),
        };

        wifiProfile.ads.push(newAd);
        await wifiProfile.save();

        this.logger.log(`Created ad "${dto.title}" for business ${businessId}`);
        return newAd;
    }

    /**
     * Update an existing ad
     */
    async updateAd(
        businessId: string,
        adId: string,
        ownerId: string,
        dto: UpdateAdDto,
        file?: Express.Multer.File
    ): Promise<Ad> {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to update this ad');
        }

        const wifiProfile = await this.findOrCreateWifiProfile(businessId);
        const adIndex = wifiProfile.ads.findIndex(ad => ad.id.toString() === adId);

        if (adIndex === -1) {
            throw new NotFoundException('Ad not found');
        }

        // Handle file upload
        if (file) {
            const uploadResult = await this.saveUploadedFile(file);
            dto.mediaUrl = uploadResult.url;
            dto.mediaType = uploadResult.type;
        }

        // Update the ad
        const updatedAd = { ...wifiProfile.ads[adIndex], ...dto };
        wifiProfile.ads[adIndex] = updatedAd as any;
        await wifiProfile.save();

        this.logger.log(`Updated ad ${adId} for business ${businessId}`);
        return updatedAd as Ad;
    }

    /**
     * Delete an ad
     */
    async deleteAd(businessId: string, adId: string, ownerId: string): Promise<void> {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to delete this ad');
        }

        const wifiProfile = await this.findOrCreateWifiProfile(businessId);
        const adIndex = wifiProfile.ads.findIndex(ad => ad.id.toString() === adId);

        if (adIndex === -1) {
            throw new NotFoundException('Ad not found');
        }

        wifiProfile.ads.splice(adIndex, 1);
        await wifiProfile.save();

        this.logger.log(`Deleted ad ${adId} from business ${businessId}`);
    }

    /**
     * Handle file upload
     */
    async uploadMedia(file: Express.Multer.File): Promise<{ url: string; type: string; filename: string }> {
        return this.saveUploadedFile(file);
    }

    /**
     * Save uploaded file to disk
     */
    private async saveUploadedFile(file: Express.Multer.File): Promise<{ url: string; type: string; filename: string }> {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(this.uploadDir, filename);

        // Determine media type
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const videoExts = ['.mp4', '.webm', '.mov', '.avi'];

        let type = 'image';
        if (videoExts.includes(ext)) {
            type = 'video';
        } else if (!imageExts.includes(ext)) {
            throw new BadRequestException('Invalid file type. Allowed: jpg, jpeg, png, gif, webp, mp4, webm, mov, avi');
        }

        // Write file
        fs.writeFileSync(filepath, file.buffer);

        // Return URL (relative to server root)
        const url = `/uploads/${filename}`;

        this.logger.log(`Uploaded file: ${filename}`);

        return {
            url,
            type,
            filename: file.originalname,
        };
    }

    /**
     * Increment ad views (called from analytics)
     */
    async incrementViews(businessId: string, adId: string): Promise<void> {
        await this.wifiProfileModel.updateOne(
            { businessId: new Types.ObjectId(businessId), 'ads.id': new Types.ObjectId(adId) },
            { $inc: { 'ads.$.views': 1 } }
        );
    }

    /**
     * Increment ad clicks (called from analytics)
     */
    async incrementClicks(businessId: string, adId: string): Promise<void> {
        await this.wifiProfileModel.updateOne(
            { businessId: new Types.ObjectId(businessId), 'ads.id': new Types.ObjectId(adId) },
            { $inc: { 'ads.$.clicks': 1 } }
        );
    }
}
