'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { Star, Sparkles, Flame, Leaf, Edit2, Plus, Trash2 } from 'lucide-react';
import { CatalogCategory, CatalogItem, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import { AddItemModal } from './AddItemModal';
import { AddCategoryModal } from './AddCategoryModal';

interface CatalogItemCardProps {
    item: CatalogItem;
    index: number;
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CatalogItemCardComponent = ({ item, index, theme, isEditMode, onEdit, onDelete }: CatalogItemCardProps) => {
    const tagIcons: Record<string, React.ReactNode> = {
        bestseller: <Star className="w-3 h-3" />,
        new: <Sparkles className="w-3 h-3" />,
        featured: <Flame className="w-3 h-3" />,
        veg: <Leaf className="w-3 h-3 text-green-400" />,
        spicy: <Flame className="w-3 h-3 text-red-400" />,
    };

    const tagColors: Record<string, string> = {
        bestseller: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        new: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        featured: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        veg: 'bg-green-500/20 text-green-300 border-green-500/30',
        'non-veg': 'bg-red-500/20 text-red-300 border-red-500/30',
        spicy: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    // Check if theme is likely light mode based on text color
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    // Base styles based on theme.cardStyle
    const cardBaseStyles = {
        glass: isLightTheme ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10',
        flat: isLightTheme ? 'bg-black/5 border-transparent' : 'bg-white/10 border-transparent',
        outline: isLightTheme ? 'bg-transparent border-black/20' : 'bg-transparent border-white/20',
        minimal: 'bg-transparent border-transparent',
        solid: isLightTheme ? 'bg-white border-black/10' : 'bg-[#1a1a1a] border-white/10',
    };

    return (
        <div
            className={cn(
                'group relative rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1 border',
                cardBaseStyles[theme.cardStyle || 'glass'],
                isLightTheme ? 'hover:border-black/20 hover:bg-black/10' : 'hover:border-white/20 hover:bg-white/10',
                !item.isAvailable && 'opacity-50',
            )}
            style={{
                animationDelay: `${index * 60}ms`,
            }}
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-black/20">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center">
                        <span className="text-4xl">{item.title.charAt(0)}</span>
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                                    tagColors[tag] || 'bg-white/20 text-white border-white/30',
                                )}
                            >
                                {tagIcons[tag]}
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Unavailable overlay */}
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/50">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="font-semibold text-sm truncate mb-1" style={{ color: 'var(--text-color)' }}>
                    {item.title}
                </h3>
                {item.description && (
                    <p className="text-xs line-clamp-2 mb-2 min-h-8" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--primary)' }}
                    >
                        {item.currency}{item.price}
                    </span>
                </div>
            </div>

            {/* Edit mode overlay */}
            {isEditMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/40 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export const CatalogItemCard = memo(CatalogItemCardComponent, (prev, next) => {
    return (
        prev.item === next.item &&
        prev.index === next.index &&
        prev.isEditMode === next.isEditMode &&
        prev.theme.cardStyle === next.theme.cardStyle &&
        prev.theme.textColor === next.theme.textColor
        // Ignore primaryColor
    );
});

interface CatalogSectionProps {
    title: string;
    categories: CatalogCategory[];
    items: CatalogItem[];
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onUpdateItems?: (items: CatalogItem[]) => void;
    onUpdateCategories?: (categories: CatalogCategory[]) => void;
    businessId: string;
}

function CatalogSectionComponent({
    categories,
    items,
    theme,
    isEditMode,
    onUpdateItems,
    onUpdateCategories,
    businessId
}: CatalogSectionProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id || null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);

    // Check if theme is likely light mode
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    const filteredItems = activeCategory
        ? items.filter(item => item.categoryId === activeCategory)
        : items;

    // ... (item handlers remain same)

    const handleAddCategory = () => {
        if (!onUpdateCategories) return;
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategoryClick = (category: CatalogCategory, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onUpdateCategories) return;
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = () => {
        if (!onUpdateCategories || !editingCategory) return;

        const newCategories = categories.filter(c => c.id !== editingCategory.id);
        onUpdateCategories(newCategories);

        // If we deleted the active category, switch to the first one available
        if (activeCategory === editingCategory.id) {
            setActiveCategory(newCategories[0]?.id || null);
        }
    };

    const handleSaveCategory = (name: string, emoji: string) => {
        if (!onUpdateCategories) return;

        if (editingCategory) {
            // Update existing
            const newCategories = categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name, emoji }
                    : c
            );
            onUpdateCategories(newCategories);
        } else {
            // Create new
            const newCategory: CatalogCategory = {
                id: `cat-${Date.now()}`,
                name: name,
                emoji: emoji
            };

            const newCategories = [...categories, newCategory];
            onUpdateCategories(newCategories);
            setActiveCategory(newCategory.id);
        }

        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    // ... (rest of item handlers)

    const handleSaveItem = (itemData: Partial<CatalogItem>) => {
        if (!onUpdateItems || !activeCategory) return;

        let newItems = [...items];

        if (editingItem) {
            // Update
            newItems = newItems.map(i => i.id === editingItem.id ? { ...i, ...itemData } as CatalogItem : i);
        } else {
            // Add
            const newItem: CatalogItem = {
                id: `item-${Date.now()}`,
                categoryId: activeCategory,
                title: itemData.title || 'New Item',
                price: itemData.price || 0,
                currency: itemData.currency || '₹',
                isAvailable: true,
                ...itemData
            } as CatalogItem;
            newItems.push(newItem);
        }

        onUpdateItems(newItems);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemToDelete: CatalogItem) => {
        if (!onUpdateItems) return;
        const newItems = items.filter(i => i.id !== itemToDelete.id);
        onUpdateItems(newItems);
    };

    const openForAdd = () => {
        if (!activeCategory) return;
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openForEdit = (item: CatalogItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div
            className="mt-8"
        >


            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                {categories.map((category) => (
                    <div
                        role="button"
                        tabIndex={0}
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveCategory(category.id);
                            }
                        }}
                        className={cn(
                            'cursor-pointer shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border relative group select-none active:scale-95 hover:scale-105',
                            activeCategory === category.id
                                ? 'text-white border-transparent'
                                : 'bg-transparent hover:bg-white/10',
                        )}
                        style={{
                            background: activeCategory === category.id
                                ? 'var(--primary)'
                                : undefined,
                            color: activeCategory === category.id ? '#fff' : 'var(--text-color)',
                            borderColor: activeCategory === category.id ? 'transparent' : 'color-mix(in srgb, var(--text-color) 30%, transparent)',
                        }}
                    >
                        {category.emoji && <span className="mr-1">{category.emoji}</span>}
                        {category.name}

                        {isEditMode && (
                            <div className="absolute -top-1 -right-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleEditCategoryClick(category, e)}
                                    className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
                                >
                                    <Edit2 className="w-2.5 h-2.5 text-white" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {isEditMode && (
                    <button
                        onClick={handleAddCategory}
                        className="shrink-0 px-3 py-2 rounded-full text-sm font-medium bg-white/5 border border-dashed text-white/50 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        style={{ color: 'var(--text-color)', borderColor: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}
                    >
                        + New Category
                    </button>
                )}
            </div>

            {/* Items Grid */}
            <div
                key={activeCategory}
                className="grid grid-cols-2 gap-3 content-auto"
            >
                {filteredItems.map((item, index) => (
                    <CatalogItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        theme={theme}
                        isEditMode={isEditMode}
                        onEdit={() => openForEdit(item)}
                        onDelete={() => handleDeleteItem(item)}
                    />
                ))}
                {isEditMode && (
                    <button
                        onClick={openForAdd}
                        className={cn(
                            "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors group",
                            isLightTheme
                                ? "border-black/10 hover:border-black/20 hover:bg-black/5"
                                : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                        style={{ color: 'var(--text-color)' }}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            isLightTheme ? "bg-black/5 group-hover:bg-black/10" : "bg-white/10 group-hover:bg-white/20"
                        )}>
                            <Plus className="w-5 h-5 opacity-70" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Add Item</span>
                    </button>
                )}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && !isEditMode && (
                <div
                    className="p-8 rounded-2xl border-2 border-dashed text-center animate-fade-in"
                    style={{ borderColor: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}
                >
                    <p className="text-white/50 mb-3" style={{ color: 'var(--text-color)', opacity: 0.5 }}>No items in {categories.find(c => c.id === activeCategory)?.name}</p>
                    {isEditMode && (
                        <button
                            onClick={openForAdd}
                            className="px-4 py-2 rounded-xl bg-white/10 font-medium hover:bg-white/20 transition-colors"
                            style={{ color: 'var(--text-color)', background: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}
                        >
                            Add Item
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveItem}
                onDelete={editingItem ? () => handleDeleteItem(editingItem) : undefined}
                initialData={editingItem}
                key={editingItem ? editingItem.id : 'new'}
                businessId={businessId}
                theme={theme}
            />

            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                onSave={handleSaveCategory}
                onDelete={editingCategory ? handleDeleteCategory : undefined}
                theme={theme}
                initialData={editingCategory}
                key={editingCategory ? editingCategory.id : 'new-cat'}
            />
        </div>
    );
}

export const CatalogSection = memo(CatalogSectionComponent, (prev, next) => {
    return (
        prev.businessId === next.businessId &&
        prev.title === next.title &&
        prev.categories === next.categories &&
        prev.items === next.items &&
        prev.isEditMode === next.isEditMode &&
        prev.theme.cardStyle === next.theme.cardStyle &&
        prev.theme.textColor === next.theme.textColor
        // Ignore primaryColor
    );
});
