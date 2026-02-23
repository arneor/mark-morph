import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { S3Service } from '../media/s3.service';

@Injectable()
export class BannersService {
    private readonly logger = new Logger(BannersService.name);

    constructor(
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        private readonly s3Service: S3Service,
    ) { }

    /**
     * Create a new banner (admin only)
     */
    async create(dto: CreateBannerDto, file?: Express.Multer.File): Promise<BannerDocument> {
        let imageUrl = dto.imageUrl || '';
        let imageS3Key = '';

        if (file) {
            const result = await this.s3Service.upload(file, 'system', 'banners', 'near-me-banners');
            imageUrl = result.url;
            imageS3Key = result.key;
        }

        const banner = await this.bannerModel.create({
            ...dto,
            imageUrl,
            imageS3Key,
        });

        this.logger.log(`Created banner: ${banner.title} (${banner._id})`);
        return banner;
    }

    /**
     * Update a banner (admin only)
     */
    async update(id: string, dto: UpdateBannerDto, file?: Express.Multer.File): Promise<BannerDocument> {
        const banner = await this.bannerModel.findById(id);
        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        if (file) {
            // Delete old image from S3
            if (banner.imageS3Key) {
                await this.s3Service.delete(banner.imageS3Key);
            }
            const result = await this.s3Service.upload(file, 'system', 'banners', 'near-me-banners');
            dto.imageUrl = result.url;
            (banner as any).imageS3Key = result.key;
        }

        Object.assign(banner, dto);
        await banner.save();

        this.logger.log(`Updated banner: ${banner.title} (${id})`);
        return banner;
    }

    /**
     * Delete a banner (admin only)
     */
    async delete(id: string): Promise<void> {
        const banner = await this.bannerModel.findById(id);
        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        if (banner.imageS3Key) {
            await this.s3Service.delete(banner.imageS3Key);
        }

        await this.bannerModel.findByIdAndDelete(id);
        this.logger.log(`Deleted banner: ${id}`);
    }

    /**
     * Get all banners sorted by position (admin)
     */
    async findAll(): Promise<BannerDocument[]> {
        return this.bannerModel.find().sort({ position: 1, createdAt: -1 }).exec();
    }

    /**
     * Get active banners for public carousel
     */
    async findActive(): Promise<BannerDocument[]> {
        const now = new Date();
        return this.bannerModel
            .find({
                isActive: true,
                $or: [
                    { startsAt: { $exists: false } },
                    { startsAt: null },
                    { startsAt: { $lte: now } },
                ],
                $and: [
                    {
                        $or: [
                            { expiresAt: { $exists: false } },
                            { expiresAt: null },
                            { expiresAt: { $gte: now } },
                        ],
                    },
                ],
            })
            .sort({ position: 1 })
            .exec();
    }
}
