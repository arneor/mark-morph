import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Common Module
import { CommonModule } from './common/common.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { AdsModule } from './modules/ads/ads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { HealthModule } from './modules/health/health.module';
import { SplashModule } from './modules/splash/splash.module';
import { MediaModule } from './modules/media/media.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local', '.env.development'],
        }),

        // MongoDB Connection
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/markmorph_dev',
            }),
            inject: [ConfigService],
        }),

        // Rate Limiting (Throttler)
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                throttlers: [
                    {
                        ttl: configService.get<number>('THROTTLE_TTL') || 60000,
                        limit: configService.get<number>('THROTTLE_LIMIT') || 100,
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
