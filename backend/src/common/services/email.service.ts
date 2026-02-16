import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Resend } from "resend";

export type OtpPurpose = "admin_login" | "wifi_access" | "business_auth";

interface OtpEmailData {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  businessName?: string; // For WiFi access emails
  expiryMinutes?: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private useResend = false;
  private readonly DEFAULT_EXPIRY_MINUTES = 10;

  constructor(private configService: ConfigService) {
    this.initializeEmailProvider();
  }

  private initializeEmailProvider(): void {
    const nodeEnv = this.configService.get<string>("NODE_ENV") || "development";
    const isProduction = nodeEnv === "production";

    this.logger.log(
      `📧 Initializing email service for environment: ${nodeEnv}`,
    );

    // In PRODUCTION: Use Resend (works on cloud platforms like Render)
    if (isProduction) {
      const resendApiKey = this.configService.get<string>("RESEND_API_KEY");

      if (resendApiKey) {
        this.resend = new Resend(resendApiKey);
        this.useResend = true;
        this.logger.log(
          "📧 [PRODUCTION] Email service configured with Resend API",
        );
        return;
      } else {
        this.logger.warn(
          "⚠️ [PRODUCTION] RESEND_API_KEY not found! Emails will fail.",
        );
      }
    }

    // In DEVELOPMENT: Use Gmail SMTP (works locally)
    const host = this.configService.get<string>("EMAIL_HOST");
    const port = this.configService.get<number>("EMAIL_PORT") || 587;
    const user = this.configService.get<string>("EMAIL_USER");
    const pass = this.configService.get<string>("EMAIL_PASS");

    this.logger.log(
      `📧 Email config check - Host: ${host ? "SET" : "MISSING"}, User: ${user ? "SET" : "MISSING"}, Pass: ${pass ? "SET" : "MISSING"}, Port: ${port}`,
    );

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      this.logger.log(
        `📧 [DEVELOPMENT] Email service configured with Gmail SMTP: ${host}:${port}`,
      );
    } else {
      this.logger.warn(
        "⚠️ No email credentials found. Using MOCK email service.",
      );
    }
  }

  /**
   * Send OTP email based on purpose
   */
  async sendOtpEmail(data: OtpEmailData): Promise<void> {
    const {
      email,
      otp,
      purpose,
      businessName,
      expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
    } = data;

    const template = this.getEmailTemplate(
      purpose,
      otp,
      expiryMinutes,
      businessName,
    );

    // Use appropriate from email based on provider
    const gmailFrom =
      this.configService.get<string>("EMAIL_FROM") ||
      this.configService.get<string>("EMAIL_USER");
    const resendFrom = "noreply@linkbeet.in"; // Verified domain in Resend

    // Use Resend if available (production)
    if (this.useResend && this.resend) {
      try {
        this.logger.log(`📧 Sending ${purpose} OTP via Resend to: ${email}`);

        const { data: result, error } = await this.resend.emails.send({
          from: `Linkbeet <${resendFrom}>`,
          to: [email],
          subject: template.subject,
          html: template.html,
        });

        if (error) {
          this.logger.error(`❌ Resend error: ${JSON.stringify(error)}`);
          throw new Error(error.message);
        }

        this.logger.log(
          `✅ ${purpose} OTP email sent via Resend to ${email} | ID: ${result?.id}`,
        );
        return;
      } catch (error) {
        this.logger.error(`❌ Failed to send via Resend: ${error.message}`);
        throw new Error(`Failed to send verification code. Please try again.`);
      }
    }

    // Fallback to SMTP
    if (this.transporter) {
      try {
        this.logger.log(`📧 Sending ${purpose} OTP via SMTP to: ${email}`);

        const info = await this.transporter.sendMail({
          from: `"Linkbeet" <${gmailFrom}>`,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        this.logger.log(
          `✅ ${purpose} OTP email sent via SMTP to ${email} | MessageId: ${info.messageId}`,
        );
      } catch (error) {
        this.logger.error(`❌ Failed to send ${purpose} OTP email to ${email}`);
        this.logger.error(
          `   Error: ${error.message} | Code: ${error.code || "N/A"}`,
        );
        throw new Error(`Failed to send verification code. Please try again.`);
      }
    } else {
      // Mock mode for development
      this.logger.warn(`⚠️ [MOCK EMAIL] No email provider configured`);
      this.logger.log(
        `📧 [MOCK EMAIL] Purpose: ${purpose} | To: ${email} | OTP: ${otp}`,
      );
    }
  }

  /**
   * Get email template based on purpose
   */
  private getEmailTemplate(
    purpose: OtpPurpose,
    otp: string,
    expiryMinutes: number,
    businessName?: string,
  ): { subject: string; html: string } {
    const baseStyles = `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        `;

    const otpBoxStyle = `
            background: linear-gradient(135deg, #f6f8fb 0%, #f1f3f6 100%);
            padding: 25px;
            text-align: center;
            border-radius: 12px;
            border: 2px dashed #e0e0e0;
            margin: 0 0 30px;
        `;

    const otpCodeStyle = `
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        `;

    const warningBoxStyle = `
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 0 0 25px;
        `;

    switch (purpose) {
      case "admin_login":
        return {
          subject: "🔐 LinkBeet Admin Login Code",
          html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: #f39c12; margin: 0; font-size: 24px;">🔐 Admin Access</h1>
                                <h1 style="color: #f39c12; margin: 0; font-size: 24px;">🔐 Admin Access</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">LinkBeet Admin Panel</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello Admin,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    You have requested access to the <strong>LinkBeet Admin Panel</strong>. Use the code below to complete your login:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #f39c12;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        🔒 <strong>Security Notice:</strong> This code expires in <strong>${expiryMinutes} minutes</strong>. 
                                        Never share this code with anyone.
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please secure your account immediately.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    <span style="color: #f39c12; font-weight: 600;">LinkBeet</span> Admin Portal
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
        };

      case "wifi_access":
        return {
          subject: `📶 Your WiFi Access Code - ${businessName || "LinkBeet"}`,
          html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">📶 WiFi Access Code</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">for ${businessName || "LinkBeet WiFi"}</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    Use the verification code below to connect to the WiFi network at <strong>${businessName || "this location"}</strong>:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #667eea;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>
                                    </p>
                                </div>
                                
                                <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin: 0 0 25px;">
                                    <p style="color: #2e7d32; font-size: 14px; margin: 0; text-align: center;">
                                        🎉 Enjoy free WiFi at ${businessName || "this location"}!
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please ignore this email.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Powered by <span style="color: #667eea; font-weight: 600;">LinkBeet</span>
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
        };

      case "business_auth":
        return {
          subject: "🏢 LinkBeet Business Verification Code",
          html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Business Verification</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">LinkBeet for Business</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello Business Owner,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    You're one step away from accessing your <strong>LinkBeet Business Dashboard</strong>. 
                                    Enter the verification code below to continue:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #11998e;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>
                                    </p>
                                </div>
                                
                                <div style="background: #f0f9ff; border-radius: 8px; padding: 15px; margin: 0 0 25px;">
                                    <p style="color: #0369a1; font-size: 14px; margin: 0;">
                                        💡 <strong>Tip:</strong> Manage your WiFi portal, ads, and analytics from your dashboard!
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please ignore this email or contact support.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    <span style="color: #11998e; font-weight: 600;">LinkBeet</span> for Business
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
        };

      default:
        throw new Error(`Unknown OTP purpose: ${purpose}`);
    }
  }

  /**
   * Verify transporter is working
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log("✅ Email transporter connection verified");
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Email transporter verification failed: ${error.message}`,
      );
      return false;
    }
  }
}
