import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { SplashController } from "./splash.controller";
import { SplashService } from "./splash.service";
import { WifiUser, WifiUserSchema } from "./schemas/wifi-user.schema";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import {
  WifiProfile,
  WifiProfileSchema,
} from "../business/schemas/wifi-profile.schema";
import { BusinessModule } from "../business/business.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WifiUser.name, schema: WifiUserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: WifiProfile.name, schema: WifiProfileSchema },
    ]),
    ConfigModule,
    forwardRef(() => BusinessModule),
    AnalyticsModule,
  ],
  controllers: [SplashController],
  providers: [SplashService],
  exports: [SplashService],
})
export class SplashModule {}
