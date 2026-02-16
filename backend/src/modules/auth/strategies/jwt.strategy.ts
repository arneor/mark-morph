import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    businessId?: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'linkbeet-admin-secret-change-in-production-2026',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.getUserFromToken(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            businessId: payload.businessId,
        };
    }
}
