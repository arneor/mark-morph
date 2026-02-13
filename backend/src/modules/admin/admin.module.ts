import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminAnalyticsController } from './admin-analytics.controller'; // New Controller
import { AdminService } from './admin.service';
import { AdminAnalyticsService } from './admin-analytics.service'; // New Service
import { Admin, AdminSchema } from './schemas/admin.schema';
import { AdminAccessLog, AdminAccessLogSchema } from './schemas/admin-access-log.schema';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { Business, BusinessSchema } from '../business/schemas/business.schema';
import { WifiProfile, WifiProfileSchema } from '../business/schemas/wifi-profile.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AnalyticsLog, AnalyticsLogSchema } from '../analytics/schemas/analytics-log.schema';
import { ComplianceLog, ComplianceLogSchema } from '../compliance/schemas/compliance-log.schema';
import { WifiUser, WifiUserSchema } from '../splash/schemas/wifi-user.schema'; // Needed for analytics

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: AdminAccessLog.name, schema: AdminAccessLogSchema },
            { name: Business.name, schema: BusinessSchema },
            { name: WifiProfile.name, schema: WifiProfileSchema },
            { name: User.name, schema: UserSchema },
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: ComplianceLog.name, schema: ComplianceLogSchema },
            { name: WifiUser.name, schema: WifiUserSchema }, // Added Schema
        ]),
        PassportModule.register({ defaultStrategy: 'admin-jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ADMIN_SECRET') ||
                    configService.get<string>('JWT_SECRET') + '_admin',
                signOptions: {
                    expiresIn: '30m', // 30 minute session for admin
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AdminController, AdminAnalyticsController], // Added Controller
    providers: [AdminService, AdminAnalyticsService, AdminJwtStrategy], // Added Service
    exports: [AdminService],
})
export class AdminModule { }
