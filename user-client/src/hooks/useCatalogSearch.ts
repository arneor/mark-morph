import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CatalogItem, CatalogCategory } from '@/lib/treeProfileTypes';

// ─── Levenshtein Distance (Typo Tolerance) ───────────────────────────
function levenshtein(a: string, b: string): number {
    const an = a.length;
    const bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;

    // Optimisation: single-row DP
    const row = Array.from({ length: bn + 1 }, (_, i) => i);
    for (let i = 1; i <= an; i++) {
        let prev = i;
        for (let j = 1; j <= bn; j++) {
            const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
            row[j - 1] = prev;
            prev = val;
        }
        row[bn] = prev;
    }
    return row[bn];
}

// ─── Synonym Map ─────────────────────────────────────────────────────
const SYNONYMS: Record<string, string[]> = {
    veg: ['vegetarian', 'veggie', 'plant-based'],
    'non-veg': ['nonveg', 'meat', 'chicken', 'fish', 'egg'],
    spicy: ['hot', 'chili', 'chilli'],
    drink: ['beverage', 'juice', 'shake', 'smoothie', 'tea', 'coffee'],
    sweet: ['dessert', 'cake', 'pastry', 'ice cream'],
    snack: ['starter', 'appetizer', 'finger food'],
    combo: ['meal', 'platter', 'thali'],
    pizza: ['pie'],
    burger: ['sandwich'],
    rice: ['biryani', 'pulao', 'fried rice'],
    bread: ['naan', 'roti', 'paratha', 'chapati'],
    new: ['latest', 'recent'],
    bestseller: ['popular', 'best', 'top', 'trending', 'best seller'],
    featured: ['special', 'recommended', 'chef'],
};

function expandSynonyms(query: string): string[] {
    const lower = query.toLowerCase();
    const expanded: string[] = [lower];

    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
        if (lower === key || synonyms.includes(lower)) {
            expanded.push(key, ...synonyms);
        }
    }

    return [...new Set(expanded)];
}

// ─── Scoring Engine ──────────────────────────────────────────────────
interface ScoredItem {
    item: CatalogItem;
    score: number;
    matchedField: 'title' | 'description' | 'tag' | 'category';
}

function scoreItem(
    item: CatalogItem,
    queryTerms: string[],
    categories: CatalogCategory[]
): ScoredItem | null {
    let bestScore = 0;
    let bestField: ScoredItem['matchedField'] = 'title';

    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const tags = (item.tags || []).map(t => t.toLowerCase());
    const category = categories.find(c => c.id === item.categoryId);
    const categoryName = category?.name.toLowerCase() || '';

    for (const term of queryTerms) {
        // 1. Exact title match (highest score)
        if (titleLower === term) {
            bestScore = Math.max(bestScore, 100);
            bestField = 'title';
        }
        // 2. Title starts with term
        else if (titleLower.startsWith(term)) {
            bestScore = Math.max(bestScore, 90);
            bestField = 'title';
        }
        // 3. Title contains term
        else if (titleLower.includes(term)) {
            bestScore = Math.max(bestScore, 80);
            bestField = 'title';
        }
        // 4. Title word starts with term
        else if (titleLower.split(/\s+/).some(word => word.startsWith(term))) {
            bestScore = Math.max(bestScore, 75);
            bestField = 'title';
        }

        // 5. Tag exact match
        if (tags.includes(term)) {
            bestScore = Math.max(bestScore, 70);
            bestField = 'tag';
        }

        // 6. Category match
        if (categoryName.includes(term)) {
            bestScore = Math.max(bestScore, 65);
            bestField = 'category';
        }

        // 7. Description contains
        if (descLower.includes(term)) {
            bestScore = Math.max(bestScore, 50);
            bestField = 'description';
        }

        // 8. Fuzzy match on title words (typo tolerance)
        if (bestScore < 40) {
            const titleWords = titleLower.split(/\s+/);
            for (const word of titleWords) {
                const maxDist = term.length <= 4 ? 1 : term.length <= 7 ? 2 : 3;
                const dist = levenshtein(term, word);
                if (dist <= maxDist && dist > 0) {
                    const fuzzyScore = 40 - dist * 5;
                    if (fuzzyScore > bestScore) {
                        bestScore = fuzzyScore;
                        bestField = 'title';
                    }
                }
            }
        }

        // 9. Fuzzy match on category name
        if (bestScore < 30 && categoryName.length > 0) {
            const maxDist = term.length <= 4 ? 1 : 2;
            const dist = levenshtein(term, categoryName);
            if (dist <= maxDist && dist > 0) {
                bestScore = Math.max(bestScore, 25);
                bestField = 'category';
            }
        }
    }

    return bestScore > 0 ? { item, score: bestScore, matchedField: bestField } : null;
}

// ─── Suggestion Generator ────────────────────────────────────────────
function generateSuggestions(
    query: string,
    items: CatalogItem[],
    categories: CatalogCategory[],
    maxSuggestions: number = 3
): string[] {
    const lower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Collect all unique words from titles
    const allWords = new Set<string>();
    for (const item of items) {
        item.title.toLowerCase().split(/\s+/).forEach(w => {
            if (w.length > 2) allWords.add(w);
        });
    }
    // Add category names
    for (const cat of categories) {
        if (cat.name.length > 2) allWords.add(cat.name.toLowerCase());
    }

    // Find closest matches
    const scored: { word: string; dist: number }[] = [];
    for (const word of allWords) {
        const dist = levenshtein(lower, word);
        if (dist <= 3 && dist > 0 && word !== lower) {
            scored.push({ word, dist });
        }
    }

    scored.sort((a, b) => a.dist - b.dist);
    for (const { word } of scored.slice(0, maxSuggestions)) {
        suggestions.add(word);
    }

    return [...suggestions];
}

// ─── Main Hook ───────────────────────────────────────────────────────
export interface CatalogSearchResult {
    query: string;
    setQuery: (q: string) => void;
    debouncedQuery: string;
    results: CatalogItem[];
    isSearching: boolean;
    isActive: boolean;
    setIsActive: (active: boolean) => void;
    resultCount: number;
    matchedCategories: CatalogCategory[];
    resultCountByCategory: Map<string, number>;
    suggestions: string[];
    popularCategories: CatalogCategory[];
    clearSearch: () => void;
}

export function useCatalogSearch(
    items: CatalogItem[],
    categories: CatalogCategory[],
    debounceMs: number = 300
): CatalogSearchResult {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce the query
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const delay = query.trim().length === 0 ? 0 : debounceMs;

        timerRef.current = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [query, debounceMs]);

    // Compute results
    const { results, matchedCategories, resultCountByCategory, suggestions } = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.length === 0) {
            return { results: [], matchedCategories: [], resultCountByCategory: new Map<string, number>(), suggestions: [] };
        }

        // Expand query words with synonyms
        const rawTerms = debouncedQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        const queryTerms = rawTerms.flatMap(expandSynonyms);

        // Score all items
        const scored: ScoredItem[] = [];
        for (const item of items) {
            const result = scoreItem(item, queryTerms, categories);
            if (result) scored.push(result);
        }

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        const resultItems = scored.map(s => s.item);

        // Unique matched categories
        const catIds = new Set(resultItems.map(i => i.categoryId));
        const matched = categories.filter(c => catIds.has(c.id));

        // Per-category result counts
        const countByCat = new Map<string, number>();
        for (const item of resultItems) {
            countByCat.set(item.categoryId, (countByCat.get(item.categoryId) || 0) + 1);
        }

        // Suggestions if no results
        const sugg = resultItems.length === 0
            ? generateSuggestions(debouncedQuery, items, categories)
            : [];

        return { results: resultItems, matchedCategories: matched, resultCountByCategory: countByCat, suggestions: sugg };
    }, [debouncedQuery, items, categories]);

    // Popular categories (most items)
    const popularCategories = useMemo(() => {
        const countMap = new Map<string, number>();
        for (const item of items) {
            countMap.set(item.categoryId, (countMap.get(item.categoryId) || 0) + 1);
        }
        return categories
            .map(c => ({ cat: c, count: countMap.get(c.id) || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map(c => c.cat);
    }, [items, categories]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
        setIsActive(false);
    }, []);

    const isSearching = query.trim().length > 0 && debouncedQuery !== query.trim();

    return {
        query,
        setQuery,
        debouncedQuery,
        results,
        isSearching,
        isActive,
        setIsActive,
        resultCount: results.length,
        matchedCategories,
        resultCountByCategory,
        suggestions,
        popularCategories,
        clearSearch,
    };
}
