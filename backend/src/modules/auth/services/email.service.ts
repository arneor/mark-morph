import { Injectable, Logger } from "@nestjs/common";
import { EmailService as CommonEmailService } from "../../../common/services/email.service";

/**
 * Auth-specific email service wrapper
 * Uses the centralized EmailService with 'business_auth' purpose
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private commonEmailService: CommonEmailService) {}

  async sendOtp(email: string, otp: string): Promise<boolean> {
    try {
      await this.commonEmailService.sendOtpEmail({
        email,
        otp,
        purpose: "business_auth",
        expiryMinutes: 10,
      });
      this.logger.log(`✅ Business auth OTP sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP to ${email}: ${error.message}`);
      throw error; // Re-throw so caller knows it failed
    }
  }
}
