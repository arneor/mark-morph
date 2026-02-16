import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Express } from 'express';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly region: string;

    constructor(private readonly configService: ConfigService) {
        this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
    }

    /**
     * Upload file to S3 with partitioned key structure
     */
    async upload(
        file: Express.Multer.File,
        context: 'business' | 'campaign' | 'user' | 'system',
        id: string,
        placement: string // 'branding' | 'banners' | 'gallery' | 'avatar'
    ): Promise<{ url: string; key: string }> {
        try {
            // 1. Generate Key Structure
            const prefix = this.getPrefix(context, id, placement);

            // Sanitize filename to prevent double extensions (e.g. .jpg.jpg)
            const parts = file.originalname.split('.');
            let ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';

            // Fallback extension from mimetype if empty
            if (!ext) {
                if (file.mimetype === 'image/jpeg') ext = 'jpg';
                else if (file.mimetype === 'image/png') ext = 'png';
                else if (file.mimetype === 'image/webp') ext = 'webp';
            }

            // Remove potentially duplicated extension in the name part
            let namePart = parts.join('.');
            const commonExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            for (const commonExt of commonExts) {
                if (namePart.toLowerCase().endsWith(commonExt)) {
                    namePart = namePart.substring(0, namePart.length - commonExt.length);
                    break;
                }
            }

            const cleanName = namePart.replace(/[^a-zA-Z0-9-]/g, '_');
            const filename = `${Date.now()}-${cleanName}.${ext}`;
            const key = `${prefix}${filename}`;

            // 2. Upload to S3
            // Attempt to use 'public-read' ACL to make the object publicly accessible
            // Note: If the bucket has 'Block Public Access' enabled or 'Bucket Owner Enforced', 
            // this might fail or be ignored. In that case, a Bucket Policy is required.
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            // 3. Construct URL (Direct S3 URL or CloudFront)
            // Ideally, we prepend a CDN_URL env var, but fallback to S3 URL
            const cdnUrl = this.configService.get<string>('CDN_URL');
            const url = cdnUrl
                ? `${cdnUrl}/${key}`
                : `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

            this.logger.log(`Uploaded file to S3: ${key}`);
            return { url, key };

        } catch (error) {
            this.logger.error(`S3 Upload Error: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Delete file from S3
     */
    async delete(key: string): Promise<void> {
        if (!key) return;

        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
            this.logger.log(`Deleted S3 object: ${key}`);
        } catch (error) {
            this.logger.error(`S3 Delete Error: ${key} - ${error.message}`);
            // Don't throw, just log. Cleanup failure shouldn't block main flow.
        }
    }

    private getPrefix(context: string, id: string, placement: string): string {
        switch (context) {
            case 'business':
                // Tree-profile specific placements (tree-profile-banners, tree-profile-gallery, etc.)
                if (placement.startsWith('tree-profile-')) {
                    const subFolder = placement.replace('tree-profile-', '');
                    return `businesses/${id}/tree-profile/${subFolder}/`;
                }
                // WiFi-profile placements (branding, banner, gallery)
                const folder = placement === 'banner' ? 'banners' : placement;
                return `businesses/${id}/wifi-profile/${folder}/`;
            case 'campaign':
                return `campaigns/${id}/${placement}/`;
            case 'user':
                return `users/${id}/`;
            case 'system':
                return `system/${placement}/`;
            default:
                return `misc/${id}/`;
        }
    }
}
