import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Admin, AdminDocument } from "../../modules/admin/schemas/admin.schema";
import {
  AdminAccessLog,
  AdminAccessLogDocument,
} from "../../modules/admin/schemas/admin-access-log.schema";

/**
 * Guard that allows:
 * 1. Admin to access any business route (with logging)
 * 2. Business owner to access only their own business route
 */
@Injectable()
export class BusinessOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(BusinessOwnershipGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(AdminAccessLog.name)
    private accessLogModel: Model<AdminAccessLogDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const businessIdParam = request.params.id || request.params.businessId;

    if (!businessIdParam) {
      // No business ID in route, skip ownership check
      return true;
    }

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    // Check if this is an admin token
    if (user.type === "admin" || user.role === "super_admin") {
      // Admin can access any business - log the access
      await this.logAdminAccess(user, businessIdParam, request);
      this.logger.log(
        `Admin ${user.email} accessing business ${businessIdParam}`,
      );
      return true;
    }

    // For regular business users, check ownership
    if (user.businessId && user.businessId === businessIdParam) {
      return true;
    }

    // Also check if user is the owner by userId
    // This requires fetching business, which should already be validated
    if (user.userId) {
      // The business routes should validate ownership in the service
      // Here we just ensure they have a valid token with businessId
      if (!user.businessId) {
        throw new ForbiddenException(
          "No business associated with this account",
        );
      }
    }

    throw new ForbiddenException(
      "You do not have permission to access this business",
    );
  }

  private async logAdminAccess(
    user: any,
    businessId: string,
    request: any,
  ): Promise<void> {
    try {
      const log = new this.accessLogModel({
        adminId: new Types.ObjectId(user.adminId),
        adminEmail: user.email,
        action: "view_business",
        businessId: new Types.ObjectId(businessId),
        ipAddress: request.ip || request.connection?.remoteAddress,
        userAgent: request.headers?.["user-agent"],
        details: {
          method: request.method,
          path: request.path,
        },
        timestamp: new Date(),
      });
      await log.save();
    } catch (error) {
      this.logger.error(`Failed to log admin access: ${error.message}`);
    }
  }
}
