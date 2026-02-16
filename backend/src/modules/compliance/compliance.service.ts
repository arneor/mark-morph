import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ComplianceLog,
  ComplianceLogDocument,
} from "./schemas/compliance-log.schema";

export interface ComplianceLogInput {
  macAddress: string;
  phone?: string;
  userId?: string;
  businessId?: string;
  assignedIP?: string;
  deviceType?: string;
  userAgent?: string;
  geolocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
  };
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectModel(ComplianceLog.name)
    private complianceModel: Model<ComplianceLogDocument>,
  ) {}

  /**
   * Log a new session (login event)
   */
  async logSession(input: ComplianceLogInput): Promise<ComplianceLogDocument> {
    const log = new this.complianceModel({
      macAddress: input.macAddress,
      phone: input.phone,
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      businessId: input.businessId
        ? new Types.ObjectId(input.businessId)
        : undefined,
      assignedIP: input.assignedIP,
      deviceType: input.deviceType,
      userAgent: input.userAgent,
      geolocation: input.geolocation,
      loginTime: new Date(),
    });

    await log.save();
    this.logger.log(`Compliance log created for MAC: ${input.macAddress}`);
    return log;
  }

  /**
   * Log session end (logout event)
   */
  async logSessionEnd(logId: string): Promise<void> {
    const log = await this.complianceModel.findById(logId);

    if (log && !log.logoutTime) {
      log.logoutTime = new Date();
      log.sessionDurationMinutes = Math.round(
        (log.logoutTime.getTime() - log.loginTime.getTime()) / (1000 * 60),
      );
      await log.save();
      this.logger.log(`Session ended for log: ${logId}`);
    }
  }

  /**
   * Get logs by MAC address (for compliance queries)
   */
  async getLogsByMacAddress(
    macAddress: string,
    limit: number = 100,
  ): Promise<ComplianceLogDocument[]> {
    return this.complianceModel
      .find({ macAddress })
      .sort({ loginTime: -1 })
      .limit(limit);
  }

  /**
   * Get logs by phone number
   */
  async getLogsByPhone(
    phone: string,
    limit: number = 100,
  ): Promise<ComplianceLogDocument[]> {
    return this.complianceModel
      .find({ phone })
      .sort({ loginTime: -1 })
      .limit(limit);
  }

  /**
   * Get logs by business
   */
  async getLogsByBusiness(
    businessId: string,
    limit: number = 100,
  ): Promise<ComplianceLogDocument[]> {
    return this.complianceModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .sort({ loginTime: -1 })
      .limit(limit);
  }

  /**
   * Get logs within date range (for regulatory audits)
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
  ): Promise<ComplianceLogDocument[]> {
    return this.complianceModel
      .find({
        loginTime: { $gte: startDate, $lte: endDate },
      })
      .sort({ loginTime: -1 })
      .limit(limit);
  }

  /**
   * Get compliance statistics
   */
  async getStats(): Promise<{
    totalLogs: number;
    uniqueDevices: number;
    uniquePhones: number;
    logsLast24Hours: number;
  }> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalLogs, uniqueDevices, uniquePhones, logsLast24Hours] =
      await Promise.all([
        this.complianceModel.countDocuments(),
        this.complianceModel.distinct("macAddress").then((arr) => arr.length),
        this.complianceModel
          .distinct("phone")
          .then((arr) => arr.filter((p) => p).length),
        this.complianceModel.countDocuments({ loginTime: { $gte: yesterday } }),
      ]);

    return {
      totalLogs,
      uniqueDevices,
      uniquePhones,
      logsLast24Hours,
    };
  }
}
