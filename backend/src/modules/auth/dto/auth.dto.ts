import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsEmail,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({ description: "Email address", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Password", example: "StrongPass123!" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @ApiProperty({
    description: "Device MAC address (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  macAddress?: string;
}

export class LoginDto {
  @ApiProperty({ description: "Email address", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Password", example: "StrongPass123!" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ description: "Email address", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "6-digit OTP code", example: "123456" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: "OTP must be a 6-digit number" })
  otp: string;

  @ApiProperty({
    description: "Device MAC address (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  macAddress?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: "Access token (JWT)" })
  accessToken: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Email" })
  email: string;

  @ApiProperty({ description: "User role" })
  role: string;

  @ApiProperty({ description: "Business ID", required: false })
  businessId?: string;
}

export class OtpResponseDto {
  @ApiProperty({ description: "Success status" })
  success: boolean;

  @ApiProperty({ description: "Response message" })
  message: string;

  @ApiProperty({ description: "OTP expiry" })
  expiresIn?: number;
}
// ---- Password Management DTOs ----

export class ForgotPasswordDto {
  @ApiProperty({ description: "Email address", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email address", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "6-digit OTP code", example: "123456" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: "OTP must be a 6-digit number" })
  otp: string;

  @ApiProperty({ description: "New password", example: "NewStrongPass123!" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: "Current password" })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: "New password", example: "NewStrongPass123!" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string;
}

export class RequestEmailChangeDto {
  @ApiProperty({
    description: "New email address",
    example: "newemail@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}

export class VerifyEmailChangeDto {
  @ApiProperty({
    description: "New email address",
    example: "newemail@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @ApiProperty({ description: "6-digit OTP code", example: "123456" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: "OTP must be a 6-digit number" })
  otp: string;
}
