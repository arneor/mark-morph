import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { VerifyService } from "./services/verify.service";
import { EmailService } from "./services/email.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { User, UserSchema } from "./schemas/user.schema";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import {
  ComplianceLog,
  ComplianceLogSchema,
} from "../compliance/schemas/compliance-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: ComplianceLog.name, schema: ComplianceLogSchema },
    ]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "your-secret-key",
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "7d",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerifyService, EmailService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
