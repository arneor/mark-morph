'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Camera, Star, Sparkles, Flame, Leaf, ShoppingBag, CreditCard, Tag } from 'lucide-react';
import { CatalogItem } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: Partial<CatalogItem>) => void;
    onDelete?: () => void;
    initialData?: CatalogItem | null;
    currency?: string;
}

const TAGS: { id: string; label: string; icon: any; color: string }[] = [
    { id: 'bestseller', label: 'Bestseller', icon: Star, color: 'text-amber-400' },
    { id: 'new', label: 'New', icon: Sparkles, color: 'text-purple-400' },
    { id: 'featured', label: 'Featured', icon: Flame, color: 'text-orange-400' },
    { id: 'veg', label: 'Veg', icon: Leaf, color: 'text-green-400' },
    { id: 'non-veg', label: 'Non-Veg', icon: Leaf, color: 'text-red-400' },
    { id: 'spicy', label: 'Spicy', icon: Flame, color: 'text-red-500' },
];

export function AddItemModal({ isOpen, onClose, onSave, onDelete, initialData, currency = '₹' }: AddItemModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setPrice(initialData.price.toString());
            setImage(initialData.imageUrl || '');
            setSelectedTags(initialData.tags || []);
            setIsAvailable(initialData.isAvailable !== false);
        } else {
            setTitle('');
            setDescription('');
            setPrice('');
            setImage('');
            setSelectedTags([]);
            setIsAvailable(true);
        }
    }, [initialData, isOpen]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
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
            tags: selectedTags as any,
            isAvailable,
            currency
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-70 p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="w-full max-w-md bg-[#0f1016] border border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col"
                        >
                            {/* Header Image Area */}
                            <div className="relative h-48 bg-white/5 group shrink-0">
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
                                    <div className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>

                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-md border border-white/10"
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
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                                Item Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Classic Burger"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-1/3 space-y-1.5">
                                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                                Price ({currency})
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-serif">
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Ingedients, details, etc..."
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm resize-none"
                                        />
                                    </div>

                                    {/* Availability Toggle */}
                                    <div className="flex items-center justify-between py-2 px-1">
                                        <span className="text-sm font-medium text-white/80">Item Available</span>
                                        <button
                                            onClick={() => setIsAvailable(!isAvailable)}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative",
                                                isAvailable ? "bg-[#3CEAC8]" : "bg-white/10"
                                            )}
                                        >
                                            <motion.div
                                                animate={{ x: isAvailable ? 24 : 0 }}
                                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1 flex items-center gap-2">
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
                                                                : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white/60"
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
                            <div className="p-6 pt-2 bg-linear-to-t from-[#0f1016] to-transparent shrink-0 flex gap-3">
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
                                    disabled={!title || !price}
                                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                >
                                    {initialData ? 'Save Changes' : 'Add Item to Menu'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
