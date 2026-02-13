'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Trash2,
    ImageIcon,
    Upload,
    Pencil,
    Check,
    Grid3x3
} from 'lucide-react';
import { ProfileGalleryImage, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { businessApi } from '@/lib/api';

interface GallerySectionProps {
    businessId: string;
    images: ProfileGalleryImage[];
    isEditMode: boolean;
    onUpdate: (images: ProfileGalleryImage[]) => void;
    theme: TreeProfileTheme;
}

export function GallerySection({ businessId, images = [], isEditMode, onUpdate, theme }: GallerySectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingImage, setEditingImage] = useState<ProfileGalleryImage | null>(null);
    const MAX_IMAGES = 10;

    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        if (images.length + files.length > MAX_IMAGES) {
            alert(`Maximum ${MAX_IMAGES} gallery images allowed.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            const newImagesPromises = files.map(async (file) => {
                // Upload to S3 via backend
                const { url } = await businessApi.uploadMedia(businessId, file, 'tree-profile-gallery');

                return {
                    id: crypto.randomUUID(),
                    imageUrl: url,
                    caption: file.name.replace(/\.[^/.]+$/, "")
                };
            });

            const newImages = await Promise.all(newImagesPromises);
            onUpdate([...images, ...newImages]);
        } catch (error) {
            console.error("Failed to upload gallery image:", error);
            alert("Failed to upload image. Please try again.");
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        onUpdate(images.filter(img => img.id !== id));
    };

    const handleEditImage = (image: ProfileGalleryImage, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingImage({ ...image });
    };

    const handleSaveEdit = () => {
        if (!editingImage) return;
        onUpdate(images.map(img => img.id === editingImage.id ? editingImage : img));
        setEditingImage(null);
    };

    // Grid layout helper for VIEW MODE - subtle variations for visual interest
    const getItemClass = (index: number) => {
        // Pattern repeats every 9 items for variety
        const patterns = [
            'col-span-1 row-span-1', // Standard square
            'col-span-2 row-span-1', // Wide rectangle
            'col-span-1 row-span-1', // Standard square
            'col-span-1 row-span-2', // Tall rectangle
            'col-span-1 row-span-1', // Standard square
            'col-span-1 row-span-1', // Standard square
            'col-span-1 row-span-1', // Standard square
            'col-span-2 row-span-1', // Wide rectangle
            'col-span-1 row-span-1', // Standard square
        ];
        return patterns[index % patterns.length];
    };

    if (!isEditMode && images.length === 0) return null;

    return (
        <div className="w-full mb-8">
            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Section Header */}
            <motion.div
                className="flex items-center justify-between mb-4 px-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <h3
                        className="text-sm font-black uppercase tracking-widest"
                        style={{
                            color: theme.textColor,
                            opacity: 0.8
                        }}
                    >
                        Gallery ({images.length}/{MAX_IMAGES})
                    </h3>
                </div>
                {isEditMode && images.length < MAX_IMAGES && (
                    <Button
                        size="sm"
                        onClick={handleAddImage}
                        className="h-7 text-xs gap-1 backdrop-blur-xl rounded-full"
                        style={{
                            backgroundColor: theme.primaryColor,
                            color: ['#FFFFFF', '#F5F5F5'].includes(theme.backgroundColor) ? '#FFFFFF' : '#000000'
                        }}
                    >
                        <Plus className="w-3 h-3" /> Add Post
                    </Button>
                )}
            </motion.div>

            {isEditMode ? (
                /* EDIT MODE: Simple Grid with Controls (User Requested) */
                <div className="grid grid-cols-2 gap-3">
                    {images.map((image) => (
                        <GalleryCard
                            key={image.id}
                            image={image}
                            isEditMode={true}
                            onDelete={(e) => handleDelete(image.id, e)}
                            onEdit={(e) => handleEditImage(image, e)}
                        />
                    ))}

                    {/* Add New Placeholder */}
                    {images.length < MAX_IMAGES && (
                        <div
                            onClick={handleAddImage}
                            className="aspect-4/5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all text-center p-4"
                            style={{
                                borderColor: `${theme.textColor}40`,
                                backgroundColor: `${theme.textColor}08`
                            }}
                        >
                            <Upload className="w-8 h-8 mb-2" style={{ color: theme.textColor, opacity: 0.5 }} />
                            <span className="text-xs font-medium" style={{ color: theme.textColor, opacity: 0.5 }}>
                                Upload New
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                /* VIEW MODE: Masonry Grid Layout (Restored) */
                <>
                    {images.length === 0 ? (
                        <motion.div
                            className="aspect-video w-full rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/40 gap-3 backdrop-blur-sm"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-cyan-500/20 blur-2xl" />
                                <ImageIcon className="w-10 h-10 relative z-10" />
                            </div>
                            <span className="text-sm font-medium">No images yet</span>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-3 auto-rows-[140px] gap-3">
                            {images.map((image, idx) => {
                                const gridClass = getItemClass(idx);
                                return (
                                    <motion.div
                                        key={image.id}
                                        className={`relative overflow-hidden rounded-3xl group cursor-pointer ${gridClass}`}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{
                                            delay: idx * 0.05,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 15
                                        }}
                                        whileHover={{
                                            scale: 1.03,
                                            zIndex: 10,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="relative w-full h-full bg-linear-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image.imageUrl}
                                                alt={image.caption || 'Gallery Image'}
                                                className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-90"
                                            />

                                            {/* Subtle Border Glow */}
                                            <div
                                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{
                                                    boxShadow: `inset 0 0 0 2px ${theme.primaryColor}40, 0 0 20px ${theme.primaryColor}20`
                                                }}
                                            />

                                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {image.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                                    <div className="backdrop-blur-xl bg-black/60 rounded-2xl px-3 py-2 border border-white/20">
                                                        <p className="text-xs text-white font-semibold truncate">
                                                            {image.caption}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Edit Modal */}
            <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Photo</DialogTitle>
                    </DialogHeader>
                    {editingImage && (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="aspect-4/5 rounded-lg overflow-hidden bg-black/30 relative border border-white/10 w-1/2 mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={editingImage.imageUrl}
                                    alt={editingImage.caption}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-white/80">Caption</Label>
                                    <Input
                                        value={editingImage.caption || ''}
                                        onChange={(e) =>
                                            setEditingImage({ ...editingImage, caption: e.target.value })
                                        }
                                        className="bg-white/10 border-white/20 text-white mt-1.5"
                                        placeholder="Enter caption..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditingImage(null)}
                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    className="text-[#222]"
                                    style={{ backgroundColor: theme.primaryColor }}
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

// Individual Gallery Card Component (Used only in Edit Mode)
interface GalleryCardProps {
    image: ProfileGalleryImage;
    isEditMode: boolean;
    onDelete?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
}

function GalleryCard({
    image,
    isEditMode,
    onDelete,
    onEdit,
}: GalleryCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl group aspect-4/5 w-full"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image.imageUrl}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-white font-medium text-xs leading-snug line-clamp-2">
                    {image.caption}
                </div>
            </div>

            {/* Edit Mode Controls */}
            {isEditMode && (
                <>
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <button
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                            <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full bg-red-500/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/60 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Edit mode indicator */}
                    <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
                </>
            )}
        </motion.div>
    );
}
