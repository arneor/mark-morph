import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User, UserDocument } from "../schemas/user.schema";
import { VerifyService } from "./verify.service";
import { EmailService } from "./email.service";
import {
  SignupDto,
  LoginDto,
  VerifyEmailOtpDto,
  AuthResponseDto,
  OtpResponseDto,
} from "../dto/auth.dto";
import {
  Business,
  BusinessDocument,
} from "../../business/schemas/business.schema";
import {
  ComplianceLog,
  ComplianceLogDocument,
} from "../../compliance/schemas/compliance-log.schema";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_REQUESTS_PER_HOUR = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(ComplianceLog.name)
    private complianceLogModel: Model<ComplianceLogDocument>,
    private jwtService: JwtService,
    private verifyService: VerifyService,
    private emailService: EmailService,
  ) { }

  /**
   * Signup with Email and Password
   */
  async signup(dto: SignupDto): Promise<OtpResponseDto> {
    const { email, password, macAddress } = dto;

    // Check if user exists
    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new BadRequestException("Email account already exists");
      }

      // User exists but is not verified - we will overwrite/update this user
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;

      // Generate new OTP
      const otp = this.verifyService.generateOtp();
      existingUser.otp = otp;
      existingUser.otpExpiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
      );
      existingUser.otpRequestCount = 1;
      existingUser.lastOtpRequestAt = new Date();

      if (macAddress) existingUser.macAddress = macAddress;

      await existingUser.save();

      // Send OTP via Email
      await this.emailService.sendOtp(email, otp);

      return {
        success: true,
        message: "OTP sent to your email address",
        expiresIn: this.OTP_EXPIRY_MINUTES * 60,
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      macAddress,
      role: "user", // Default role
      isVerified: false,
    });

    // Generate OTP
    const otp = this.verifyService.generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );
    user.otpRequestCount = 1;
    user.lastOtpRequestAt = new Date();

    await user.save();

    // Send OTP via Email
    await this.emailService.sendOtp(email, otp);

    return {
      success: true,
      message: "OTP sent to your email address",
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Login with Email and Password
   */
  async login(dto: LoginDto): Promise<OtpResponseDto> {
    const { email, password } = dto;

    // Find user and select password
    const user = await this.userModel.findOne({ email }).select("+password");

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Check password
    if (!user.password) {
      throw new UnauthorizedException(
        "Invalid email or password. Please reset your password.",
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Rate limiting logic
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      user.lastOtpRequestAt &&
      user.lastOtpRequestAt > oneHourAgo &&
      user.otpRequestCount >= this.MAX_OTP_REQUESTS_PER_HOUR
    ) {
      // Reset if significant time passed, else block
      // Simple logic for now: allow login attempts but maybe limit OTP generation
    }

    // Generate new OTP
    const otp = this.verifyService.generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    user.lastOtpRequestAt = new Date();

    await user.save();

    // Send OTP via Email
    await this.emailService.sendOtp(email, otp);

    return {
      success: true,
      message: "OTP sent to your email address",
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  async verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<AuthResponseDto> {
    const { email, otp, macAddress } = dto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedException("No OTP found. Please login again.");
    }

    if (new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException("OTP has expired. Please login again.");
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException("Invalid OTP.");
    }

    return this.createSession(user, macAddress);
  }

  /**
   * Private helper to create an authenticated session
   */
  private async createSession(
    user: UserDocument,
    macAddress?: string,
  ): Promise<AuthResponseDto> {
    // Mark as verified if not already
    if (!user.isVerified) {
      user.isVerified = true;
      user.lastLogin = new Date();
    } else {
      user.lastLogin = new Date();
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;

    if (macAddress) user.macAddress = macAddress;
    await user.save();

    // Compliance Log
    await this.logCompliance(user, macAddress);

    // Get business info for the JWT payload (don't block login based on status)
    const business = await this.businessModel.findOne({ ownerId: user._id });

    // Generate Token
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      businessId: business?._id?.toString(),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId: business?._id?.toString(),
    };
  }

  /**
   * Log compliance data for PM-WANI
   */
  private async logCompliance(
    user: UserDocument,
    macAddress?: string,
  ): Promise<void> {
    try {
      const complianceLog = new this.complianceLogModel({
        macAddress: macAddress || user.macAddress || "unknown",
        phone: user.phone || "email-user",
        userId: user._id,
        loginTime: new Date(),
      });

      await complianceLog.save();
      this.logger.log(`Compliance log created for user ${user._id}`);
    } catch (error) {
      this.logger.error(`Failed to create compliance log: ${error.message}`);
    }
  }

  /**
   * Get user from JWT payload
   */
  async getUserFromToken(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async getBusinessIdForUser(userId: string): Promise<string | null> {
    const business = await this.businessModel
      .findOne({ ownerId: new Types.ObjectId(userId) })
      .select("_id");
    return business ? business._id.toString() : null;
  }

  /**
   * Forgot Password - Send OTP to email for password reset
   */
  async forgotPassword(email: string): Promise<OtpResponseDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      // Don't reveal whether the email exists
      return {
        success: true,
        message: "If this email is registered, a reset code has been sent.",
        expiresIn: this.OTP_EXPIRY_MINUTES * 60,
      };
    }

    const otp = this.verifyService.generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    user.lastOtpRequestAt = new Date();

    await user.save();
    await this.emailService.sendOtp(email, otp);

    return {
      success: true,
      message: "If this email is registered, a reset code has been sent.",
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Reset Password - Verify OTP and set new password
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException("Invalid email or OTP.");
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedException(
        "No reset code found. Please request a new one.",
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException(
        "Reset code has expired. Please request a new one.",
      );
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException("Invalid reset code.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    // After reset, we want to log them in immediately
    return this.createSession(user);
  }

  /**
   * Change Password - Authenticated user changes their password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findById(userId).select("+password");

    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    if (!user.password) {
      throw new BadRequestException(
        "No password set. Please use forgot password to set one.",
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return { success: true, message: "Password changed successfully." };
  }

  /**
   * Request Email Change - Send OTP to the NEW email for verification
   */
  async requestEmailChange(
    userId: string,
    newEmail: string,
  ): Promise<OtpResponseDto> {
    // Check if new email is already taken
    const existingUser = await this.userModel.findOne({ email: newEmail });
    if (existingUser) {
      throw new BadRequestException("This email is already in use.");
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    const otp = this.verifyService.generateOtp();
    user.pendingEmail = newEmail;
    user.pendingEmailOtp = otp;
    user.pendingEmailOtpExpiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await user.save();
    await this.emailService.sendOtp(newEmail, otp);

    return {
      success: true,
      message: `Verification code sent to ${newEmail}`,
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Verify Email Change - Confirm OTP and apply the email change
   */
  async verifyEmailChange(
    userId: string,
    newEmail: string,
    otp: string,
  ): Promise<{ success: boolean; message: string; email: string }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    if (!user.pendingEmail || !user.pendingEmailOtp || !user.pendingEmailOtpExpiresAt) {
      throw new BadRequestException(
        "No pending email change found. Please request a new one.",
      );
    }

    if (user.pendingEmail !== newEmail) {
      throw new BadRequestException("Email mismatch. Please request a new change.");
    }

    if (new Date() > user.pendingEmailOtpExpiresAt) {
      throw new UnauthorizedException("Verification code has expired.");
    }

    if (user.pendingEmailOtp !== otp) {
      throw new UnauthorizedException("Invalid verification code.");
    }

    // Apply the email change
    user.email = newEmail;
    user.pendingEmail = undefined;
    user.pendingEmailOtp = undefined;
    user.pendingEmailOtpExpiresAt = undefined;

    await user.save();

    return {
      success: true,
      message: "Email updated successfully.",
      email: newEmail,
    };
  }
}
