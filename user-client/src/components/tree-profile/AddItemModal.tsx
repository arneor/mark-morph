import { useState, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { X, Trash2, Camera, Star, Sparkles, Flame, Leaf, ShoppingBag, CreditCard, Tag, LucideIcon, Loader2 } from 'lucide-react';
import { CatalogItem, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';

// Client-side mount detection without useEffect setState
const emptySubscribe = () => () => { };
function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,   // client: mounted
        () => false    // server: not mounted
    );
}
import Image from 'next/image';
import { businessApi } from '@/lib/api';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: Partial<CatalogItem>) => void;
    onDelete?: () => void;
    initialData?: CatalogItem | null;
    currency?: string;
    businessId: string;
    theme: TreeProfileTheme;
}

const TAGS: { id: string; label: string; icon: LucideIcon; color: string }[] = [
    { id: 'bestseller', label: 'Bestseller', icon: Star, color: 'text-amber-400' },
    { id: 'new', label: 'New', icon: Sparkles, color: 'text-purple-400' },
    { id: 'featured', label: 'Featured', icon: Flame, color: 'text-orange-400' },
    { id: 'veg', label: 'Veg', icon: Leaf, color: 'text-green-400' },
    { id: 'non-veg', label: 'Non-Veg', icon: Leaf, color: 'text-red-400' },
    { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-red-500' },
];

export function AddItemModal({ isOpen, onClose, onSave, onDelete, initialData, currency = '₹', businessId, theme }: AddItemModalProps) {
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    // Dynamic Styles
    const styles = {
        modalBg: isLightTheme ? 'bg-white border-black/10' : 'bg-[#0f1016] border-white/10',
        inputBg: isLightTheme ? 'bg-black/5 border-black/10 focus:border-black/30' : 'bg-black/40 border-white/10 focus:border-white/30',
        text: isLightTheme ? 'text-black' : 'text-white',
        textMuted: isLightTheme ? 'text-black/60' : 'text-white/60',
        textDim: isLightTheme ? 'text-black/40' : 'text-white/40',
        placeholder: isLightTheme ? 'placeholder-black/40' : 'placeholder-white/40',
        headerBg: isLightTheme ? 'bg-black/5' : 'bg-white/5',
        iconBg: isLightTheme ? 'bg-black/10 border-black/20 hover:bg-black/20' : 'bg-white/10 border-white/20 hover:bg-white/20',
        closeBtn: isLightTheme ? 'bg-white/40 text-black/70 hover:text-black hover:bg-white/60 border-black/10' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60 border-white/10',
    };
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price.toString() || '');
    const [image, setImage] = useState(initialData?.imageUrl || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
    const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable !== false);
    const [isUploading, setIsUploading] = useState(false);
    const [s3Key, setS3Key] = useState(initialData?.s3Key || '');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const previewUrl = URL.createObjectURL(file);
            setImage(previewUrl);

            // Upload
            try {
                setIsUploading(true);
                // Use a generic placement since there isn't one specifically for catalog items yet, 
                // or use 'tree-profile-catalog' if the backend supports it (based on api.ts it might not, but let's check api.ts again or just use 'gallery'/generic for now, 
                // actually api.ts has 'tree-profile-catalog' in the union type in my learnings? let me check my learnings)
                // Re-checking api.ts learning: "placement: 'branding' | 'banner' | 'gallery' | 'tree-profile-banners' | 'tree-profile-gallery' | 'tree-profile-catalog' | 'tree-profile-profile'"
                // So 'tree-profile-catalog' IS supported in the type definition in api.ts!
                const { url, key } = await businessApi.uploadMedia(businessId, file, 'tree-profile-catalog');
                setImage(url); // Replace preview with real S3 URL
                setS3Key(key);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload image");
                setImage(initialData?.imageUrl || ''); // Revert
            } finally {
                setIsUploading(false);
            }
        }
    };

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(prev => prev.filter(t => t !== tagId));
        } else {
            setSelectedTags(prev => [...prev, tagId]);
        }
    };

    const handleSave = () => {
        if (!title || !price) return;
        onSave({
            title,
            description,
            price: parseFloat(price),
            imageUrl: image,
            s3Key,
            tags: selectedTags as CatalogItem['tags'],
            isAvailable,
            currency
        });
        onClose();
    };

    const mounted = useIsMounted();

    if (!mounted) return null;

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
            />

            {/* ModalContainer - Ensure high z-index and flex centering */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <div
                    className={cn(
                        "w-full max-w-md rounded-3xl overflow-hidden shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col border animate-fade-in",
                        styles.modalBg
                    )}
                >
                    {/* Header Image Area */}
                    <div className={cn("relative h-48 group shrink-0", styles.headerBg)}>
                        {image ? (
                            <Image
                                src={image}
                                alt="Preview"
                                fill
                                className="object-cover transition-opacity group-hover:opacity-50"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-2">
                                <Camera className="w-8 h-8" />
                                <span className="text-xs font-medium uppercase tracking-wider">Add Item Photo</span>
                            </div>
                        )}

                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-[2px]">
                            <div className={cn("p-3 rounded-full backdrop-blur-md border transition-colors", styles.iconBg)}>
                                {isUploading ? <Loader2 className={cn("w-6 h-6 animate-spin", styles.text)} /> : <Camera className={cn("w-6 h-6", styles.text)} />}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </label>

                        <button
                            onClick={onClose}
                            className={cn("absolute top-4 right-4 p-2 rounded-full transition-colors backdrop-blur-md border", styles.closeBtn)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-5">
                            {/* Title & Price Row */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.textMuted)}>
                                        Item Name
                                    </label>
                                    <div className="relative">
                                        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", styles.textDim)}>
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Classic Burger"
                                            className={cn(
                                                "w-full rounded-xl py-3 pl-10 pr-4 transition-all font-medium border focus:outline-none focus:ring-1",
                                                styles.inputBg,
                                                styles.text,
                                                styles.placeholder,
                                                isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="w-1/3 space-y-1.5">
                                    <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.textMuted)}>
                                        Price ({currency})
                                    </label>
                                    <div className="relative">
                                        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 font-serif", styles.textDim)}>
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className={cn(
                                                "w-full rounded-xl py-3 pl-10 pr-4 transition-all font-mono border focus:outline-none focus:ring-1",
                                                styles.inputBg,
                                                styles.text,
                                                styles.placeholder,
                                                isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.textMuted)}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ingredients, details, etc..."
                                    rows={3}
                                    className={cn(
                                        "w-full rounded-xl py-3 px-4 transition-all text-sm resize-none border focus:outline-none focus:ring-1",
                                        styles.inputBg,
                                        styles.text,
                                        styles.placeholder,
                                        isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                    )}
                                />
                            </div>

                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between py-2 px-1">
                                <span className={cn("text-sm font-medium", styles.text)}>Item Available</span>
                                <button
                                    onClick={() => setIsAvailable(!isAvailable)}
                                    className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative",
                                        isAvailable ? "bg-[#3CEAC8]" : (isLightTheme ? "bg-black/10" : "bg-white/10")
                                    )}
                                >
                                    <div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
                                        style={{ transform: isAvailable ? 'translateX(24px)' : 'translateX(0)' }}
                                    />
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1 flex items-center gap-2", styles.textMuted)}>
                                    <Tag className="w-3 h-3" /> Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map((tag) => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border transition-all",
                                                    isSelected
                                                        ? `${tag.color.replace('text-', 'bg-')}/20 ${tag.color} ${tag.color.replace('text-', 'border-')}/30`
                                                        : cn(
                                                            "bg-transparent hover:text-opacity-100",
                                                            isLightTheme
                                                                ? "text-black/40 border-black/10 hover:border-black/30"
                                                                : "text-white/40 border-white/10 hover:border-white/30"
                                                        )
                                                )}
                                            >
                                                <tag.icon className="w-3 h-3" />
                                                {tag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={cn("p-6 pt-2 shrink-0 flex gap-3 bg-linear-to-t to-transparent", isLightTheme ? "from-white" : "from-[#0f1016]")}>
                        {initialData && onDelete && (
                            <button
                                onClick={() => {
                                    onDelete();
                                    onClose();
                                }}
                                className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!title || !price || isUploading}
                            className={cn(
                                "flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)]",
                                isLightTheme
                                    ? "bg-black text-white hover:bg-black/90"
                                    : "bg-white text-black hover:bg-white/90"
                            )}
                        >
                            {isUploading ? 'Uploading...' : (initialData ? 'Save Changes' : 'Add Item to Menu')}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
