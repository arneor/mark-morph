import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdsController } from "./ads.controller";
import { AdsService } from "./ads.service";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import {
  WifiProfile,
  WifiProfileSchema,
} from "../business/schemas/wifi-profile.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: WifiProfile.name, schema: WifiProfileSchema },
    ]),
    AuthModule,
  ],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
