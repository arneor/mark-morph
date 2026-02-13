import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AnalyticsLogDocument = AnalyticsLog & Document;

@Schema({ timestamps: true, collection: 'analytics_logs' })
export class AnalyticsLog {
    @ApiProperty({ description: 'Unique identifier' })
    _id: Types.ObjectId;

    @ApiProperty({ description: 'Ad ID', type: String })
    @Prop({ type: Types.ObjectId, required: true, index: true })
    adId: Types.ObjectId;

    @ApiProperty({ description: 'Business ID', type: String })
    @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
    businessId: Types.ObjectId;

    @ApiProperty({ description: 'User ID (optional)', type: String })
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @ApiProperty({ description: 'User Email (optional)' })
    @Prop()
    email?: string;

    @ApiProperty({ description: 'Interaction type', enum: ['view', 'click', 'LIKE', 'SHARE', 'GALLERY_EXPAND'] })
    @Prop({ type: String, enum: ['view', 'click', 'LIKE', 'SHARE', 'GALLERY_EXPAND'], required: true })
    interactionType: string;

    @ApiProperty({ description: 'Device type' })
    @Prop()
    deviceType?: string;

    @ApiProperty({ description: 'Device MAC address for compliance' })
    @Prop()
    macAddress?: string;

    @ApiProperty({ description: 'IP address' })
    @Prop()
    ipAddress?: string;

    @ApiProperty({ description: 'User agent string' })
    @Prop()
    userAgent?: string;

    @ApiProperty({ description: 'Session ID' })
    @Prop()
    sessionId?: string;

    @ApiProperty({ description: 'Interaction timestamp' })
    @Prop({ default: Date.now, index: true })
    timestamp: Date;
}

export const AnalyticsLogSchema = SchemaFactory.createForClass(AnalyticsLog);

// Indexes for analytics queries
AnalyticsLogSchema.index({ businessId: 1, timestamp: -1 });
AnalyticsLogSchema.index({ adId: 1, interactionType: 1 });
AnalyticsLogSchema.index({ businessId: 1, interactionType: 1, timestamp: -1 });
