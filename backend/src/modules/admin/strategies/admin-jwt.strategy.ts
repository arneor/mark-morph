import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AdminService } from "../admin.service";

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: "admin";
  iat?: number;
  exp?: number;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
  constructor(
    private adminService: AdminService,
    configService: ConfigService,
  ) {
    const adminSecret =
      configService.get<string>("JWT_ADMIN_SECRET") ||
      configService.get<string>("JWT_SECRET") + "_admin";

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: adminSecret,
    });
  }

  async validate(payload: AdminJwtPayload) {
    // Verify it's an admin token
    if (payload.type !== "admin") {
      throw new UnauthorizedException("Invalid token type");
    }

    const admin = await this.adminService.validateAdminToken(payload);

    if (!admin) {
      throw new UnauthorizedException("Admin not found or inactive");
    }

    return {
      adminId: payload.sub,
      email: payload.email,
      role: payload.role,
      type: "admin",
    };
  }
}
