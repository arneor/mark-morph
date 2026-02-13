import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ComplianceLogDocument = ComplianceLog & Document;

@Schema({
    timestamps: true,
    collection: 'compliance_logs',
})
export class ComplianceLog {
    @ApiProperty({ description: 'Unique identifier' })
    _id: Types.ObjectId;

    @ApiProperty({ description: 'Device MAC address (PM-WANI requirement)' })
    @Prop({ required: true, index: true })
    macAddress: string;

    @ApiProperty({ description: 'Assigned IP address' })
    @Prop()
    assignedIP?: string;

    @ApiProperty({ description: 'User phone number' })
    @Prop({ index: true })
    phone?: string;

    @ApiProperty({ description: 'User ID', type: String })
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @ApiProperty({ description: 'Business ID', type: String })
    @Prop({ type: Types.ObjectId, ref: 'Business', index: true })
    businessId?: Types.ObjectId;

    @ApiProperty({ description: 'Login timestamp' })
    @Prop({ required: true, default: Date.now })
    loginTime: Date;

    @ApiProperty({ description: 'Logout timestamp' })
    @Prop()
    logoutTime?: Date;

    @ApiProperty({ description: 'Session duration in minutes' })
    @Prop()
    sessionDurationMinutes?: number;

    @ApiProperty({ description: 'Device type' })
    @Prop()
    deviceType?: string;

    @ApiProperty({ description: 'User agent string' })
    @Prop()
    userAgent?: string;

    @ApiProperty({ description: 'Geolocation data' })
    @Prop({ type: Object })
    geolocation?: {
        latitude?: number;
        longitude?: number;
        city?: string;
        region?: string;
    };

    @ApiProperty({ description: 'Record creation timestamp (for TTL)' })
    @Prop({ default: Date.now })
    createdAt: Date;
}

export const ComplianceLogSchema = SchemaFactory.createForClass(ComplianceLog);

// PM-WANI Compliance: 365-day TTL auto-deletion
// Records will be automatically deleted after 365 days
ComplianceLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60 } // 365 days in seconds
);

// Additional indexes for compliance queries
ComplianceLogSchema.index({ macAddress: 1, loginTime: -1 });
ComplianceLogSchema.index({ phone: 1, loginTime: -1 });
ComplianceLogSchema.index({ businessId: 1, loginTime: -1 });
