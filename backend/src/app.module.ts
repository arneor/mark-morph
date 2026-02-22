import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

// Common Module
import { CommonModule } from "./common/common.module";

// Feature Modules
import { AuthModule } from "./modules/auth/auth.module";
import { BusinessModule } from "./modules/business/business.module";
import { AdsModule } from "./modules/ads/ads.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ComplianceModule } from "./modules/compliance/compliance.module";
import { HealthModule } from "./modules/health/health.module";
import { SplashModule } from "./modules/splash/splash.module";
import { MediaModule } from "./modules/media/media.module";
import { OffersModule } from "./modules/offers/offers.module";

@Module({
  imports: [
    // Configuration — loads the correct .env file based on NODE_ENV
    // Priority: .env.{NODE_ENV} → .env.local → .env (first match wins per key)
    // Running locally (NODE_ENV=development) → loads .env.development → DEV database
    // Running on Render (NODE_ENV=production) → loads .env.production → PROD database
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`, // .env.development or .env.production
        '.env.local',                                     // Local overrides (optional)
        '.env',                                           // Fallback
      ],
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>("MONGODB_URI") ||
          "mongodb://localhost:27017/linkbeet_dev",
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting (Throttler)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>("THROTTLE_TTL") || 60000,
            limit: configService.get<number>("THROTTLE_LIMIT") || 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Common Module (Global - Email Service, etc.)
    CommonModule,

    // Feature Modules
    AuthModule,
    BusinessModule,
    AdsModule,
    AnalyticsModule,
    AdminModule,
    ComplianceModule,
    HealthModule,
    SplashModule,
    MediaModule,
    OffersModule,
  ],
  providers: [
    // Global Throttler Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
