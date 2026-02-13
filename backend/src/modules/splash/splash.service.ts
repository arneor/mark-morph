import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
    Logger,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { WifiUser, WifiUserDocument } from './schemas/wifi-user.schema';
import { Business, BusinessDocument } from '../business/schemas/business.schema';
import { WifiProfile, WifiProfileDocument } from '../business/schemas/wifi-profile.schema';
import { AnalyticsService } from '../analytics/analytics.service';
import { EmailService } from '../../common/services/email.service';
import { RequestOtpDto, OtpResponseDto, VerifyOtpDto, VerifyResponseDto, GoogleAuthDto, GoogleAuthResponseDto } from './dto/splash.dto';

@Injectable()
export class SplashService {
    private readonly logger = new Logger(SplashService.name);
    private readonly MAX_OTP_REQUESTS_PER_HOUR = 3;
    private readonly OTP_EXPIRY_MINUTES = 10;
    private readonly RESEND_COOLDOWN_SECONDS = 60;
    private readonly BCRYPT_ROUNDS = 10;
    private googleClient: OAuth2Client;

    constructor(
        @InjectModel(WifiUser.name) private wifiUserModel: Model<WifiUserDocument>,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
        @InjectModel(WifiProfile.name) private wifiProfileModel: Model<WifiProfileDocument>,
        private configService: ConfigService,
        private emailService: EmailService,
        private analyticsService: AnalyticsService,
    ) {
        // Initialize Google OAuth client
        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        this.googleClient = new OAuth2Client(googleClientId);
    }

    /**
     * Generate a 6-digit OTP
     */
    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Authenticate with Google OAuth
     */
    async authenticateWithGoogle(
        businessId: string,
        dto: GoogleAuthDto
    ): Promise<GoogleAuthResponseDto> {
        const { credential, ipAddress, deviceInfo, sessionId } = dto;

        // Verify business exists and is active
        const business = await this.businessModel.findById(businessId);
        if (!business) {
            throw new NotFoundException('Business not found');
        }
        if (business.status !== 'active') {
            throw new BadRequestException('This WiFi network is currently unavailable');
        }

        // Verify Google token
        let googlePayload;
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: credential,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });
            googlePayload = ticket.getPayload();
        } catch (error) {
            this.logger.error(`Google token verification failed: ${error.message}`);
            throw new UnauthorizedException('Invalid Google credentials. Please try again.');
        }

        if (!googlePayload || !googlePayload.email) {
            throw new UnauthorizedException('Unable to retrieve email from Google account');
        }

        const {
            sub: googleId,
            email,
            email_verified,
            name,
            given_name,
            family_name,
            picture,
            locale,
        } = googlePayload;

        // Find or create WiFi user
        let wifiUser = await this.wifiUserModel.findOne({
            businessId: new Types.ObjectId(businessId),
            email: email.toLowerCase(),
        });

        const isNewUser = !wifiUser;
        const now = new Date();

        if (wifiUser) {
            // Update existing user with Google info
            wifiUser.googleId = googleId;
            wifiUser.fullName = name || wifiUser.fullName;
            wifiUser.firstName = given_name || wifiUser.firstName;
            wifiUser.lastName = family_name || wifiUser.lastName;
            wifiUser.profilePictureUrl = picture || wifiUser.profilePictureUrl;
            wifiUser.emailVerifiedByGoogle = email_verified || false;
            wifiUser.locale = locale || wifiUser.locale;
            wifiUser.authMethod = 'google';
            wifiUser.isVerified = true;
            wifiUser.verifiedAt = now;
            wifiUser.visitCount = (wifiUser.visitCount || 0) + 1;
            wifiUser.lastVisitAt = now;
            wifiUser.ipAddress = ipAddress || wifiUser.ipAddress;
            wifiUser.deviceInfo = deviceInfo || wifiUser.deviceInfo;
        } else {
            // Create new WiFi user with Google info
            wifiUser = new this.wifiUserModel({
                businessId: new Types.ObjectId(businessId),
                email: email.toLowerCase(),
                googleId,
                fullName: name,
                firstName: given_name,
                lastName: family_name,
                profilePictureUrl: picture,
                emailVerifiedByGoogle: email_verified || false,
                locale,
                authMethod: 'google',
                isVerified: true,
                verifiedAt: now,
                firstLoginAt: now,
                lastVisitAt: now,
                visitCount: 1,
                ipAddress,
                deviceInfo,
                signupSource: 'wifi_splash',
            });
        }

        await wifiUser.save();

        // Get redirect URL
        // Get redirect URL from wifi profile
        const wifiProfile = await this.wifiProfileModel.findOne({ businessId: business._id });
        const redirectUrl = wifiProfile?.googleReviewUrl || 'https://google.com';

        this.logger.log(`Google OAuth successful for ${email} (${isNewUser ? 'new' : 'returning'} user) at business ${businessId}`);

        // Link anonymous session analytics to this user
        if (sessionId) {
            this.analyticsService.linkSessionToUser(sessionId, wifiUser._id.toString(), email);
        }

        // Log compliance
        await this.analyticsService.logCompliance(
            businessId,
            undefined, // macAddress
            ipAddress,
            'unknown', // deviceType
            deviceInfo // userAgent
        );

        return {
            success: true,
            message: isNewUser
                ? `Welcome, ${given_name || name || 'friend'}! You're connected to WiFi.`
                : `Welcome back, ${given_name || name || 'friend'}! You're connected to WiFi.`,
            email,
            name,
            picture,
            isNewUser,
            redirectUrl,
        };
    }

    /**
     * Request OTP for WiFi access
     */
    async requestOtp(
        businessId: string,
        dto: RequestOtpDto
    ): Promise<OtpResponseDto> {
        const { email, ipAddress, deviceInfo } = dto;

        // Verify business exists and is active
        const business = await this.businessModel.findById(businessId);
        if (!business) {
            throw new NotFoundException('Business not found');
        }
        if (business.status !== 'active') {
            throw new BadRequestException('This WiFi network is currently unavailable');
        }

        // Find or create WiFi user
        let wifiUser = await this.wifiUserModel
            .findOne({ businessId: new Types.ObjectId(businessId), email: email.toLowerCase() })
            .select('+otpCode');

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        if (wifiUser) {
            // Check rate limit
            if (wifiUser.otpWindowStart && wifiUser.otpWindowStart > oneHourAgo) {
                if (wifiUser.otpRequestCount >= this.MAX_OTP_REQUESTS_PER_HOUR) {
                    const resetTime = new Date(wifiUser.otpWindowStart.getTime() + 60 * 60 * 1000);
                    const waitMinutes = Math.ceil((resetTime.getTime() - now.getTime()) / 60000);
                    throw new HttpException(
                        `Too many OTP requests. Please wait ${waitMinutes} minutes.`,
                        HttpStatus.TOO_MANY_REQUESTS
                    );
                }
            } else {
                // Reset rate limit window
                wifiUser.otpRequestCount = 0;
                wifiUser.otpWindowStart = now;
            }

            // Check resend cooldown
            if (wifiUser.otpExpiry) {
                const otpCreatedAt = new Date(wifiUser.otpExpiry.getTime() - this.OTP_EXPIRY_MINUTES * 60 * 1000);
                const secondsSinceLastOtp = (now.getTime() - otpCreatedAt.getTime()) / 1000;
                if (secondsSinceLastOtp < this.RESEND_COOLDOWN_SECONDS) {
                    const cooldown = Math.ceil(this.RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp);
                    return {
                        success: false,
                        message: `Please wait ${cooldown} seconds before requesting a new OTP`,
                        cooldown,
                    };
                }
            }

            wifiUser.otpRequestCount += 1;
            wifiUser.authMethod = 'email'; // Set auth method
        } else {
            // Create new WiFi user
            wifiUser = new this.wifiUserModel({
                businessId: new Types.ObjectId(businessId),
                email: email.toLowerCase(),
                ipAddress,
                deviceInfo,
                otpRequestCount: 1,
                otpWindowStart: now,
                authMethod: 'email',
                signupSource: 'wifi_splash',
            });
        }

        // Generate and hash OTP
        const otp = this.generateOtp();
        const hashedOtp = await bcrypt.hash(otp, this.BCRYPT_ROUNDS);

        wifiUser.otpCode = hashedOtp;
        wifiUser.otpExpiry = new Date(now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
        wifiUser.ipAddress = ipAddress || wifiUser.ipAddress;
        wifiUser.deviceInfo = deviceInfo || wifiUser.deviceInfo;

        await wifiUser.save();

        // Send OTP email
        await this.sendOtpEmail(email, otp, business.businessName);

        this.logger.log(`OTP sent to ${email} for business ${businessId}`);

        return {
            success: true,
            message: 'Verification code sent to your email',
            expiresIn: this.OTP_EXPIRY_MINUTES * 60,
        };
    }

    /**
     * Verify OTP and grant WiFi access
     */
    async verifyOtp(
        businessId: string,
        dto: VerifyOtpDto
    ): Promise<VerifyResponseDto> {
        const { email, otp } = dto;

        // Find WiFi user with OTP
        const wifiUser = await this.wifiUserModel
            .findOne({
                businessId: new Types.ObjectId(businessId),
                email: email.toLowerCase()
            })
            .select('+otpCode');

        if (!wifiUser) {
            throw new UnauthorizedException('No verification request found for this email');
        }

        if (!wifiUser.otpCode || !wifiUser.otpExpiry) {
            throw new UnauthorizedException('No OTP found. Please request a new code.');
        }

        // Check expiry
        if (new Date() > wifiUser.otpExpiry) {
            throw new UnauthorizedException('OTP has expired. Please request a new code.');
        }

        // Verify OTP
        const isOtpValid = await bcrypt.compare(otp, wifiUser.otpCode);
        if (!isOtpValid) {
            throw new UnauthorizedException('Invalid verification code');
        }

        // Mark as verified
        wifiUser.isVerified = true;
        wifiUser.verifiedAt = new Date();
        wifiUser.otpCode = undefined;
        wifiUser.otpExpiry = undefined;
        wifiUser.visitCount = (wifiUser.visitCount || 0) + 1;
        wifiUser.lastVisitAt = new Date();
        if (!wifiUser.firstLoginAt) {
            wifiUser.firstLoginAt = new Date();
        }

        await wifiUser.save();

        // Get business for redirect URL
        const business = await this.businessModel.findById(businessId);
        const wifiProfile = await this.wifiProfileModel.findOne({ businessId: new Types.ObjectId(businessId) });
        const redirectUrl = wifiProfile?.googleReviewUrl || 'https://google.com';

        this.logger.log(`WiFi user verified: ${email} for business ${businessId}`);

        // Link anonymous session analytics to this user
        if (dto.sessionId) {
            this.analyticsService.linkSessionToUser(dto.sessionId, wifiUser._id.toString(), email);
        }

        // Log successful connection/compliance
        await this.analyticsService.logCompliance(
            businessId,
            undefined, // macAddress
            wifiUser.ipAddress,
            'unknown', // deviceType
            wifiUser.deviceInfo // userAgent
        );


        return {
            success: true,
            message: 'Email verified successfully! You are now connected.',
            redirectUrl,
        };
    }

    /**
     * Send OTP email
     */
    private async sendOtpEmail(email: string, otp: string, businessName: string): Promise<void> {
        await this.emailService.sendOtpEmail({
            email,
            otp,
            purpose: 'wifi_access',
            businessName,
            expiryMinutes: this.OTP_EXPIRY_MINUTES,
        });
    }

    /**
     * Check if a user is already verified for this business
     */
    async checkVerificationStatus(
        businessId: string,
        email: string
    ): Promise<{ isVerified: boolean; visitCount: number; authMethod?: string }> {
        const wifiUser = await this.wifiUserModel.findOne({
            businessId: new Types.ObjectId(businessId),
            email: email.toLowerCase(),
        });

        return {
            isVerified: wifiUser?.isVerified || false,
            visitCount: wifiUser?.visitCount || 0,
            authMethod: wifiUser?.authMethod,
        };
    }
}

