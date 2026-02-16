import { Injectable } from "@nestjs/common";

@Injectable()
export class VerifyService {
  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
