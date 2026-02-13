import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsLogSchema } from './schemas/analytics-log.schema';
import { Business, BusinessSchema } from '../business/schemas/business.schema';
import { WifiProfile, WifiProfileSchema } from '../business/schemas/wifi-profile.schema';
import { ComplianceLog, ComplianceLogSchema } from '../compliance/schemas/compliance-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: Business.name, schema: BusinessSchema },
            { name: WifiProfile.name, schema: WifiProfileSchema },
            { name: ComplianceLog.name, schema: ComplianceLogSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
