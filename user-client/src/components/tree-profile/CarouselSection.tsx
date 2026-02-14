'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
    Upload,
    Trash2,
    Star,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Check
} from 'lucide-react';
import { ProfileBanner, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SplashCarousel } from "@/components/SplashCarousel";

import { businessApi } from '@/lib/api';

interface CarouselSectionProps {
    businessId: string;
    banners: ProfileBanner[];
    isEditMode: boolean;
    onUpdate: (banners: ProfileBanner[]) => void;
    theme: TreeProfileTheme;
}

export function CarouselSection({ businessId, banners = [], isEditMode, onUpdate, theme }: CarouselSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingBanner, setEditingBanner] = useState<ProfileBanner | null>(null);

    const handleAddBanner = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        if (files.length + banners.length > 3) {
            alert("Maximum 3 featured banners allowed.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            const newBannersPromises = files.map(async (file) => {
                // Upload to S3 via backend
                const { url } = await businessApi.uploadMedia(businessId, file, 'tree-profile-banners');

                return {
                    id: crypto.randomUUID(),
                    imageUrl: url,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    isActive: true,
                    linkUrl: '#'
                };
            });

            const newBanners = await Promise.all(newBannersPromises);
            onUpdate([...banners, ...newBanners]);
        } catch (error) {
            console.error("Failed to upload banner:", error);
            alert("Failed to upload image. Please try again.");
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        onUpdate(banners.filter(b => b.id !== id));
    };

    const handleMoveLeft = (index: number) => {
        if (index <= 0) return;
        const newBanners = [...banners];
        [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
        onUpdate(newBanners);
    };

    const handleMoveRight = (index: number) => {
        if (index >= banners.length - 1) return;
        const newBanners = [...banners];
        [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
        onUpdate(newBanners);
    };

    const handleEditBanner = (banner: ProfileBanner, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingBanner({ ...banner });
    };

    const handleSaveEdit = () => {
        if (!editingBanner) return;
        onUpdate(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
        setEditingBanner(null);
    };

    // Filter active banners for display mode
    const activeBanners = banners.filter(b => b.isActive);

    if (!isEditMode && activeBanners.length === 0) return null;

    return (
        <div className="mb-8">
            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {(banners.length > 0 || isEditMode) && (
                <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Star className="w-4 h-4 text-[#FFD93D]" />
                        <span
                            className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: theme.textColor, opacity: 0.8 }}
                        >
                            Featured Offers ({banners.length}/3)
                        </span>
                    </div>

                    {isEditMode ? (
                        <div className="space-y-2">
                            <p className="text-xs px-1" style={{ color: theme.textColor, opacity: 0.5 }}>
                                Use arrows to reorder banners.
                            </p>

                            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 touch-auto scrollbar-hide">
                                {/* Add Banner Button */}
                                {banners.length < 3 && (
                                    <div
                                        onClick={handleAddBanner}
                                        className="w-72 shrink-0 aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                        style={{
                                            borderColor: `${theme.textColor}40`,
                                            backgroundColor: `${theme.textColor}08`
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${theme.textColor}15` }}>
                                            <Upload className="w-5 h-5" style={{ color: theme.textColor, opacity: 0.6 }} />
                                        </div>
                                        <span className="text-xs font-medium text-center px-2" style={{ color: theme.textColor, opacity: 0.6 }}>
                                            Add Offer Banner
                                        </span>
                                    </div>
                                )}

                                {banners.map((banner, index) => (
                                    <div key={banner.id} className="relative">
                                        <BannerCard
                                            banner={banner}
                                            isEditMode={isEditMode}
                                            onDelete={(e) => handleDelete(banner.id, e)}
                                            onEdit={(e) => handleEditBanner(banner, e)}
                                            canMoveLeft={index > 0}
                                            canMoveRight={index < banners.length - 1}
                                            onMoveLeft={() => handleMoveLeft(index)}
                                            onMoveRight={() => handleMoveRight(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <SplashCarousel
                                campaigns={activeBanners.map(b => ({
                                    id: b.id,
                                    title: b.title || '',
                                    mediaUrl: b.imageUrl,
                                    mediaType: 'image',
                                    status: 'active',
                                    duration: 5,
                                    views: 0,
                                    clicks: 0,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                } as any))}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Edit Banner Dialog */}
            <Dialog open={!!editingBanner} onOpenChange={(open) => !open && setEditingBanner(null)}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Featured Banner</DialogTitle>
                    </DialogHeader>
                    {editingBanner && (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-black/30 relative border border-white/10">
                                {/* Performance: Next.js Image for edit modal preview */}
                                <Image
                                    src={editingBanner.imageUrl}
                                    alt={editingBanner.title || 'Banner preview'}
                                    fill
                                    sizes="400px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-white/80">Title</Label>
                                    <Input
                                        value={editingBanner.title || ''}
                                        onChange={(e) =>
                                            setEditingBanner({ ...editingBanner, title: e.target.value })
                                        }
                                        className="bg-white/10 border-white/20 text-white mt-1.5"
                                        placeholder="Enter banner title..."
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80">Link URL (Optional)</Label>
                                    <Input
                                        value={editingBanner.linkUrl || ''}
                                        onChange={(e) =>
                                            setEditingBanner({ ...editingBanner, linkUrl: e.target.value })
                                        }
                                        className="bg-white/10 border-white/20 text-white mt-1.5"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditingBanner(null)}
                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    className="bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}



// Individual Banner Card Component
interface BannerCardProps {
    banner: ProfileBanner;
    isEditMode: boolean;
    onDelete?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
    canMoveLeft?: boolean;
    canMoveRight?: boolean;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
}

function BannerCard({
    banner,
    isEditMode,
    onDelete,
    onEdit,
    canMoveLeft,
    canMoveRight,
    onMoveLeft,
    onMoveRight,
}: BannerCardProps) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl bg-white/10 border border-white/20 shadow-md group w-72 shrink-0 aspect-video animate-fade-in"
        >
            {/* Performance: Next.js Image for banner cards */}
            <Image
                src={banner.imageUrl}
                alt={banner.title || 'Banner'}
                fill
                sizes="288px"
                loading="lazy"
                className="object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-white font-bold text-sm leading-snug mb-1 line-clamp-1">
                    {banner.title}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFD93D]/30 text-[#FFD93D] flex items-center gap-1 w-fit">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                </span>
            </div>

            {/* Edit Mode Controls */}
            {isEditMode && (
                <>
                    {/* Move buttons */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                        {canMoveLeft && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMoveLeft?.(); }}
                                className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                        )}
                        {canMoveRight && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMoveRight?.(); }}
                                className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <button
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                            <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full bg-red-500/50 flex items-center justify-center hover:bg-red-500/60 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Edit mode indicator */}
                    <div className="absolute inset-0 border-2 border-[#9EE53B]/50 rounded-2xl pointer-events-none" />
                </>
            )}
        </div>
    );
}
