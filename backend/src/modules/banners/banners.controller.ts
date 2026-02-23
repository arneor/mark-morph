import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    // ─── Public ────────────────────────────────────────

    @Get('active')
    @SkipThrottle()
    async getActiveBanners() {
        return this.bannersService.findActive();
    }

    // ─── Admin (guarded) ───────────────────────────────

    @Get()
    @UseGuards(AdminJwtAuthGuard)
    async findAll() {
        return this.bannersService.findAll();
    }

    @Post()
    @UseGuards(AdminJwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() dto: CreateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.bannersService.create(dto, file);
    }

    @Put(':id')
    @UseGuards(AdminJwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.bannersService.update(id, dto, file);
    }

    @Delete(':id')
    @UseGuards(AdminJwtAuthGuard)
    async remove(@Param('id') id: string) {
        await this.bannersService.delete(id);
        return { message: 'Banner deleted successfully' };
    }
}
