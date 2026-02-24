'use client';

import { memo } from 'react';
import { SearchX } from 'lucide-react';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import type { CatalogCategory, TreeProfileTheme } from '@/lib/treeProfileTypes';

interface NoResultsStateProps {
    query: string;
    suggestions: string[];
    popularCategories: CatalogCategory[];
    onSuggestionClick: (suggestion: string) => void;
    onCategoryClick: (category: CatalogCategory) => void;
    onClearSearch: () => void;
    theme: TreeProfileTheme;
}

function NoResultsStateComponent({
    query,
    suggestions,
    popularCategories,
    onSuggestionClick,
    onCategoryClick,
    onClearSearch,
    theme,
}: NoResultsStateProps) {
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center catalog-search-results-enter">
            {/* Animated search icon */}
            <div
                className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mb-5 catalog-search-no-results-icon',
                    isLightTheme ? 'bg-black/5' : 'bg-white/5'
                )}
            >
                <SearchX
                    className="w-7 h-7 opacity-30"
                    style={{ color: 'var(--text-color)' }}
                />
            </div>

            {/* Message */}
            <p
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--text-color)' }}
            >
                No results for &quot;{query}&quot;
            </p>
            <p
                className="text-xs opacity-40 mb-6"
                style={{ color: 'var(--text-color)' }}
            >
                Try a different search or browse categories below
            </p>

            {/* "Did you mean?" suggestions */}
            {suggestions.length > 0 && (
                <div className="w-full mb-6">
                    <p
                        className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2"
                        style={{ color: 'var(--text-color)' }}
                    >
                        Did you mean?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => onSuggestionClick(suggestion)}
                                className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                                    isLightTheme
                                        ? 'bg-black/3 border-black/10 hover:bg-black/5 hover:border-black/15'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                                )}
                                style={{ color: 'var(--primary)' }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular categories */}
            {popularCategories.length > 0 && (
                <div className="w-full mb-6">
                    <p
                        className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2"
                        style={{ color: 'var(--text-color)' }}
                    >
                        Popular Categories
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {popularCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryClick(cat)}
                                className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                                    isLightTheme
                                        ? 'bg-black/3 border-black/10 hover:bg-black/5'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10',
                                )}
                                style={{ color: 'var(--text-color)' }}
                            >
                                {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Browse all button */}
            <button
                onClick={onClearSearch}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                style={{
                    backgroundColor: 'var(--primary)',
                    color: isLightTheme ? '#fff' : '#000',
                }}
            >
                Browse All Items
            </button>
        </div>
    );
}

export const NoResultsState = memo(NoResultsStateComponent);
