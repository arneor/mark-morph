'use client';

import { useRef, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import type { TreeProfileTheme } from '@/lib/treeProfileTypes';

interface CatalogSearchBarProps {
    query: string;
    onQueryChange: (q: string) => void;
    isActive: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
    resultCount: number;
    isSearching: boolean;
    theme: TreeProfileTheme;
}

function CatalogSearchBarComponent({
    query,
    onQueryChange,
    isActive,
    onActivate,
    onDeactivate,
    resultCount,
    isSearching,
    theme,
}: CatalogSearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    useEffect(() => {
        if (isActive && inputRef.current) {
            // Delay focus slightly so the expand animation starts first
            const t = setTimeout(() => inputRef.current?.focus(), 180);
            return () => clearTimeout(t);
        }
    }, [isActive]);

    const handleClear = () => {
        onQueryChange('');
        onDeactivate();
    };

    const hasQuery = query.trim().length > 0;

    // ─── Collapsed state: compact pill button ───
    if (!isActive) {
        return (
            <button
                onClick={onActivate}
                className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium',
                    'border transition-all duration-200 select-none',
                    'active:scale-95 hover:scale-105',
                    isLightTheme
                        ? 'bg-black/3 border-black/8 hover:bg-black/5 hover:border-black/12'
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15',
                )}
                aria-label="Search catalog items"
            >
                <Search
                    className="w-3.5 h-3.5 opacity-50"
                    style={{ color: 'var(--text-color)' }}
                />
                <span
                    className="text-xs opacity-40 hidden min-[360px]:inline"
                    style={{ color: 'var(--text-color)' }}
                >
                    Search
                </span>
            </button>
        );
    }

    // ─── Expanded state: full-width input field ───
    return (
        <div className="flex-1 min-w-0 flex items-center gap-2 animate-[search-expand_0.3s_ease-out_both]">
            <div
                className={cn(
                    'flex-1 min-w-0 flex items-center rounded-xl border h-10 transition-colors duration-200',
                    isLightTheme
                        ? 'bg-black/5 border-black/12'
                        : 'bg-white/8 border-white/15',
                )}
            >
                {/* Search Icon */}
                <div className="pl-3 pr-1.5 flex items-center shrink-0">
                    <Search
                        className="w-4 h-4 opacity-60"
                        style={{ color: 'var(--primary)' }}
                    />
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="Search items..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    className={cn(
                        'flex-1 min-w-0 bg-transparent outline-none text-sm font-medium',
                        'placeholder:opacity-35 h-full',
                        '[&::-webkit-search-cancel-button]:hidden',
                        '[&::-webkit-search-decoration]:hidden',
                    )}
                    style={{ color: 'var(--text-color)' }}
                    aria-label="Search catalog items"
                />

                {/* Right side: result count + loading */}
                <div className="pr-2 flex items-center gap-1.5 shrink-0">
                    {/* Result count badge */}
                    {hasQuery && !isSearching && (
                        <span
                            className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums',
                                'catalog-search-count-badge',
                                isLightTheme
                                    ? 'bg-black/5 text-black/50'
                                    : 'bg-white/10 text-white/50',
                            )}
                        >
                            {resultCount}
                        </span>
                    )}

                    {/* Loading dots */}
                    {isSearching && (
                        <div className="flex gap-0.5 items-center">
                            <span className="w-1 h-1 rounded-full bg-current opacity-40 catalog-search-dot catalog-search-dot-1" style={{ color: 'var(--primary)' }} />
                            <span className="w-1 h-1 rounded-full bg-current opacity-40 catalog-search-dot catalog-search-dot-2" style={{ color: 'var(--primary)' }} />
                            <span className="w-1 h-1 rounded-full bg-current opacity-40 catalog-search-dot catalog-search-dot-3" style={{ color: 'var(--primary)' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Close / Cancel button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                }}
                className={cn(
                    'shrink-0 p-2 rounded-full transition-all duration-200 active:scale-90',
                    isLightTheme
                        ? 'hover:bg-black/8 text-black/50'
                        : 'hover:bg-white/10 text-white/50'
                )}
                aria-label="Close search"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export const CatalogSearchBar = memo(CatalogSearchBarComponent);
