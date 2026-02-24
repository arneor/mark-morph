import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TreeProfile } from '../business/schemas/tree-profile.schema';

/**
 * Search Service — Backend catalog search with in-memory caching.
 *
 * Architecture Notes:
 * - Currently queries MongoDB directly using regex-based text matching.
 * - Designed as a drop-in point for Meilisearch/Elasticsearch integration.
 * - In-memory cache for popular queries reduces DB hits.
 * - The denormalized index concept is implemented via MongoDB aggregation
 *   (flattening categories, items, and tags into a searchable view).
 */

interface CachedResult {
    data: unknown;
    timestamp: number;
}

@Injectable()
export class SearchService {
    // Simple in-memory cache for popular search results
    private cache = new Map<string, CachedResult>();
    private readonly CACHE_TTL = 60_000; // 1 minute

    constructor(
        @InjectModel(TreeProfile.name)
        private treeProfileModel: Model<TreeProfile>,
    ) { }

    /**
     * Search catalog items for a given business.
     * Uses regex matching with case-insensitive search across title,
     * description, and tags.
     */
    async searchCatalog(
        businessId: string,
        query: string,
        categoryId?: string,
        limit: number = 20,
    ) {
        if (!query || query.trim().length === 0) {
            return { results: [], total: 0, query: '' };
        }

        const normalizedQuery = query.trim().toLowerCase();
        const cacheKey = `${businessId}:${normalizedQuery}:${categoryId || 'all'}:${limit}`;

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }

        // Find the tree profile for this business
        const profile = await this.treeProfileModel
            .findOne({ businessId })
            .select('catalogItems categories')
            .lean()
            .exec();

        if (!profile) {
            return { results: [], total: 0, query: normalizedQuery };
        }

        const items = (profile as Record<string, unknown>)['catalogItems'] as Array<{
            id: string;
            categoryId: string;
            title: string;
            description?: string;
            price?: number;
            currency?: string;
            imageUrl?: string;
            tags?: string[];
            isAvailable: boolean;
        }> || [];

        // Filter and score
        const queryTerms = normalizedQuery.split(/\s+/);
        const scored = items
            .filter((item) => {
                // Category filter
                if (categoryId && item.categoryId !== categoryId) return false;
                // Availability filter
                if (!item.isAvailable) return false;
                return true;
            })
            .map((item) => {
                let score = 0;
                const titleLower = item.title.toLowerCase();
                const descLower = (item.description || '').toLowerCase();
                const tags = (item.tags || []).map((t: string) => t.toLowerCase());

                for (const term of queryTerms) {
                    // Title matching
                    if (titleLower === term) score += 100;
                    else if (titleLower.startsWith(term)) score += 90;
                    else if (titleLower.includes(term)) score += 80;

                    // Tag matching
                    if (tags.includes(term)) score += 70;

                    // Description matching
                    if (descLower.includes(term)) score += 50;
                }

                return { item, score };
            })
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        const result = {
            results: scored.map((s) => s.item),
            total: scored.length,
            query: normalizedQuery,
        };

        // Store in cache
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

        // Prune cache if too large
        if (this.cache.size > 500) {
            const oldest = [...this.cache.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp)
                .slice(0, 100);
            for (const [key] of oldest) {
                this.cache.delete(key);
            }
        }

        return result;
    }
}
