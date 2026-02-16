import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Get()
    @SkipThrottle()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'Service is healthy',
        schema: {
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string' },
                uptime: { type: 'number' },
                environment: { type: 'string' },
            },
        },
    })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            service: 'linkbeet-backend',
        };
    }

    @Get('ready')
    @SkipThrottle()
    @ApiOperation({ summary: 'Readiness check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is ready' })
    ready() {
        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('live')
    @SkipThrottle()
    @ApiOperation({ summary: 'Liveness check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is alive' })
    live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
}
