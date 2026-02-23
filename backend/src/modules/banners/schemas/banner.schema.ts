import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true })
    imageUrl: string;

    @Prop()
    imageS3Key?: string;

    @Prop({ default: '#9EE53B' })
    accentColor: string;

    @Prop()
    linkUrl?: string;

    @Prop({ enum: ['internal', 'external', 'category'], default: 'internal' })
    linkType: string;

    @Prop({ default: 0 })
    position: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    startsAt?: Date;

    @Prop()
    expiresAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ isActive: 1, position: 1 });
BannerSchema.index({ expiresAt: 1 });
