import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OffersController } from "./offers.controller";
import { OffersService } from "./offers.service";
import { Offer, OfferSchema } from "./schemas/offer.schema";
import { BusinessModule } from "../business/business.module";
import { MediaModule } from "../media/media.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
        BusinessModule,
        MediaModule,
    ],
    controllers: [OffersController],
    providers: [OffersService],
    exports: [OffersService],
})
export class OffersModule { }
