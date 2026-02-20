import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Put,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { AuthService } from "./services/auth.service";
import {
  SignupDto,
  LoginDto,
  VerifyEmailOtpDto,
  AuthResponseDto,
  OtpResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RequestEmailChangeDto,
  VerifyEmailChangeDto,
} from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register new account" })
  @ApiResponse({
    status: 201,
    description: "Account created, OTP sent to email",
    type: OtpResponseDto,
  })
  @ApiResponse({ status: 400, description: "Email already exists" })
  async signup(@Body() dto: SignupDto): Promise<OtpResponseDto> {
    this.logger.log(`Signup request for ${dto.email}`);
    return this.authService.signup(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Login with credentials" })
  @ApiResponse({
    status: 200,
    description: "Credentials valid, OTP sent to email",
    type: OtpResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto): Promise<OtpResponseDto> {
    this.logger.log(`Login request for ${dto.email}`);
    return this.authService.login(dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP and get Token" })
  @ApiResponse({
    status: 200,
    description: "OTP verified, Token issued",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid OTP" })
  async verifyOtp(@Body() dto: VerifyEmailOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyEmailOtp(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get current user profile" })
  async getCurrentUser(@CurrentUser() user: any) {
    const fullUser = await this.authService.getUserFromToken(user.userId);
    const businessId = await this.authService.getBusinessIdForUser(user.userId);
    return {
      userId: user.userId,
      email: fullUser?.email,
      phone: fullUser?.phone,
      role: user.role,
      businessId: businessId,
      name: fullUser?.name,
      isVerified: fullUser?.isVerified,
    };
  }

  // ---- Password Management ----

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: "Request password reset OTP" })
  @ApiResponse({
    status: 200,
    description: "Reset code sent if email exists",
    type: OtpResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<OtpResponseDto> {
    this.logger.log(`Forgot password request for ${dto.email}`);
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with OTP" })
  @ApiResponse({
    status: 200,
    description: "Password reset successfully",
  })
  @ApiResponse({ status: 401, description: "Invalid OTP" })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<AuthResponseDto> {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Change password (authenticated)" })
  @ApiResponse({ status: 200, description: "Password changed" })
  @ApiResponse({ status: 401, description: "Invalid current password" })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.authService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // ---- Email Change (OTP-secured) ----

  @Post("request-email-change")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Request email change (sends OTP to new email)" })
  @ApiResponse({
    status: 200,
    description: "OTP sent to new email",
    type: OtpResponseDto,
  })
  async requestEmailChange(
    @CurrentUser() user: any,
    @Body() dto: RequestEmailChangeDto,
  ): Promise<OtpResponseDto> {
    return this.authService.requestEmailChange(user.userId, dto.newEmail);
  }

  @Post("verify-email-change")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Verify OTP and apply email change" })
  @ApiResponse({
    status: 200,
    description: "Email changed successfully",
  })
  async verifyEmailChange(
    @CurrentUser() user: any,
    @Body() dto: VerifyEmailChangeDto,
  ): Promise<{ success: boolean; message: string; email: string }> {
    return this.authService.verifyEmailChange(
      user.userId,
      dto.newEmail,
      dto.otp,
    );
  }
}
