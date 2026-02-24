import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    /**
     * Search catalog items for a specific business.
     * Designed for future scaling when client-side search becomes insufficient.
     *
     * GET /search/catalog/:businessId?q=query&category=catId&limit=20
     */
    @Get('catalog/:businessId')
    async searchCatalog(
        @Param('businessId') businessId: string,
        @Query('q') query: string,
        @Query('category') categoryId?: string,
        @Query('limit') limit?: string,
    ) {
        const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 20, 100) : 20;

        return this.searchService.searchCatalog(
            businessId,
            query || '',
            categoryId,
            parsedLimit,
        );
    }
}
