import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { VerifyService } from './verify.service';
import { EmailService } from './email.service';
import {
    SignupDto,
    LoginDto,
    VerifyEmailOtpDto,
    AuthResponseDto,
    OtpResponseDto
} from '../dto/auth.dto';
import { Business, BusinessDocument } from '../../business/schemas/business.schema';
import { ComplianceLog, ComplianceLogDocument } from '../../compliance/schemas/compliance-log.schema';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly OTP_EXPIRY_MINUTES = 10;
    private readonly MAX_OTP_REQUESTS_PER_HOUR = 10;

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
        @InjectModel(ComplianceLog.name) private complianceLogModel: Model<ComplianceLogDocument>,
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
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email account already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new this.userModel({
            email,
            password: hashedPassword,
            macAddress,
            role: 'user', // Default role
            isVerified: false,
        });

        // Generate OTP
        const otp = this.verifyService.generateOtp();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
        user.otpRequestCount = 1;
        user.lastOtpRequestAt = new Date();

        await user.save();

        // Send OTP via Email
        await this.emailService.sendOtp(email, otp);

        return {
            success: true,
            message: 'OTP sent to your email address',
            expiresIn: this.OTP_EXPIRY_MINUTES * 60,
        };
    }

    /**
     * Login with Email and Password
     */
    async login(dto: LoginDto): Promise<OtpResponseDto> {
        const { email, password } = dto;

        // Find user and select password
        const user = await this.userModel.findOne({ email }).select('+password');

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Check password
        if (!user.password) {
            throw new UnauthorizedException('Invalid email or password. Please reset your password.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
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
        user.otpExpiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        user.lastOtpRequestAt = new Date();

        await user.save();

        // Send OTP via Email
        await this.emailService.sendOtp(email, otp);

        return {
            success: true,
            message: 'OTP sent to your email address',
            expiresIn: this.OTP_EXPIRY_MINUTES * 60,
        };
    }

    /**
     * Verify OTP (Email) and return JWT
     */
    async verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<AuthResponseDto> {
        const { email, otp, macAddress } = dto;

        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        if (!user.otp || !user.otpExpiresAt) {
            throw new UnauthorizedException('No OTP found. Please login again.');
        }

        if (new Date() > user.otpExpiresAt) {
            throw new UnauthorizedException('OTP has expired. Please login again.');
        }

        if (user.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP.');
        }

        // Mark as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.lastLogin = new Date();

        if (macAddress) user.macAddress = macAddress;

        await user.save();

        // Compliance Log
        await this.logCompliance(user, macAddress);

        // Get business info for the JWT payload (don't block login based on status)
        const business = await this.businessModel.findOne({ ownerId: user._id });

        // NOTE: Business status restrictions (pending, rejected, suspended) are no longer 
        // enforced at login. Users can always login and see their dashboard.
        // Status restrictions only apply to operational features like splash pages.

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
    private async logCompliance(user: UserDocument, macAddress?: string): Promise<void> {
        try {
            const complianceLog = new this.complianceLogModel({
                macAddress: macAddress || user.macAddress || 'unknown',
                phone: user.phone || 'email-user',
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
        const business = await this.businessModel.findOne({ ownerId: new Types.ObjectId(userId) }).select('_id');
        return business ? business._id.toString() : null;
    }
}
