import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    Req,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SplashService } from './splash.service';
import {
    RequestOtpDto,
    VerifyOtpDto,
    OtpResponseDto,
    VerifyResponseDto,
    GoogleAuthDto,
    GoogleAuthResponseDto,
} from './dto/splash.dto';
import { BusinessService } from '../business/business.service';

@ApiTags('Splash')
@Controller('splash')
export class SplashController {
    private readonly logger = new Logger(SplashController.name);

    constructor(
        private readonly splashService: SplashService,
        private readonly businessService: BusinessService,
    ) { }

    @Get(':businessId')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Get splash page data (public)',
        description: 'Get business and ads data for captive portal display'
    })
    @ApiParam({ name: 'businessId', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Splash page data' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async getSplashData(@Param('businessId') businessId: string) {
        return this.businessService.getSplashData(businessId);
    }

    @Post(':businessId/auth/google')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute per IP
    @ApiOperation({
        summary: 'Authenticate with Google OAuth',
        description: 'Verify Google OAuth token and grant WiFi access'
    })
    @ApiParam({ name: 'businessId', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Google auth successful', type: GoogleAuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid Google credentials' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async authenticateWithGoogle(
        @Param('businessId') businessId: string,
        @Body() dto: GoogleAuthDto,
        @Req() req: Request
    ): Promise<GoogleAuthResponseDto> {
        // Add IP and device info from request
        const authDto: GoogleAuthDto = {
            ...dto,
            ipAddress: dto.ipAddress || req.ip || req.connection?.remoteAddress,
            deviceInfo: dto.deviceInfo || req.headers['user-agent'],
        };

        return this.splashService.authenticateWithGoogle(businessId, authDto);
    }

    @Post(':businessId/request-otp')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute per IP
    @ApiOperation({
        summary: 'Request OTP for WiFi access',
        description: 'Send OTP to user email for WiFi verification'
    })
    @ApiParam({ name: 'businessId', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'OTP sent', type: OtpResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    async requestOtp(
        @Param('businessId') businessId: string,
        @Body() dto: RequestOtpDto,
        @Req() req: Request
    ): Promise<OtpResponseDto> {
        // Add IP and device info from request
        const requestDto: RequestOtpDto = {
            ...dto,
            ipAddress: dto.ipAddress || req.ip || req.connection?.remoteAddress,
            deviceInfo: dto.deviceInfo || req.headers['user-agent'],
        };

        return this.splashService.requestOtp(businessId, requestDto);
    }

    @Post(':businessId/verify-otp')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute per IP
    @ApiOperation({
        summary: 'Verify OTP and connect to WiFi',
        description: 'Verify the OTP code sent to email and grant WiFi access'
    })
    @ApiParam({ name: 'businessId', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'OTP verified', type: VerifyResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async verifyOtp(
        @Param('businessId') businessId: string,
        @Body() dto: VerifyOtpDto
    ): Promise<VerifyResponseDto> {
        return this.splashService.verifyOtp(businessId, dto);
    }

    @Get(':businessId/check/:email')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Check if email is already verified',
        description: 'Check if a user email is already verified for this business'
    })
    @ApiParam({ name: 'businessId', description: 'Business ID' })
    @ApiParam({ name: 'email', description: 'User email address' })
    @ApiResponse({ status: 200, description: 'Verification status' })
    async checkVerification(
        @Param('businessId') businessId: string,
        @Param('email') email: string
    ) {
        return this.splashService.checkVerificationStatus(businessId, email);
    }
}
