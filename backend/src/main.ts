import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // Global prefix for all API routes
    app.setGlobalPrefix('api');

    // Enable CORS
    const origins = process.env.CORS_ORIGINS;
    const corsOrigins = origins
        ? origins.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Static file serving for uploads
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    // Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('MARK MORPH API')
        .setDescription('Wi-Fi Advertising Platform MVP Backend API')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addTag('Authentication', 'OTP-based authentication endpoints')
        .addTag('Business', 'Business owner management endpoints')
        .addTag('Ads', 'Advertisement/Campaign management endpoints')
        .addTag('Analytics', 'Ad tracking and analytics endpoints')
        .addTag('Admin', 'Super admin oversight endpoints')
        .addTag('Compliance', 'PM-WANI regulatory compliance endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 MARK MORPH Backend is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
