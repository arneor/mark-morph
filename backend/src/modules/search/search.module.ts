import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import {
    TreeProfile,
    TreeProfileSchema,
} from '../business/schemas/tree-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TreeProfile.name, schema: TreeProfileSchema },
        ]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
