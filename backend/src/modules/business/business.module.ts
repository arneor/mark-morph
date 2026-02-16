import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { Business, BusinessSchema } from "./schemas/business.schema";
import { TreeProfile, TreeProfileSchema } from "./schemas/tree-profile.schema";
import { WifiProfile, WifiProfileSchema } from "./schemas/wifi-profile.schema";
import {
  AnalyticsLog,
  AnalyticsLogSchema,
} from "../analytics/schemas/analytics-log.schema";
import {
  ComplianceLog,
  ComplianceLogSchema,
} from "../compliance/schemas/compliance-log.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: TreeProfile.name, schema: TreeProfileSchema },
      { name: WifiProfile.name, schema: WifiProfileSchema },
      { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
      { name: ComplianceLog.name, schema: ComplianceLogSchema },
    ]),
    AuthModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
