import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { MediaModule } from '../media/media.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
        MediaModule,
        AdminModule,
    ],
    controllers: [BannersController],
    providers: [BannersService],
    exports: [BannersService],
})
export class BannersModule { }
