'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, ImageIcon, Grid3x3 } from 'lucide-react';
import { ProfileGalleryImage, TreeProfileTheme } from '@/lib/dummyTreeProfileData';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GallerySectionProps {
    images: ProfileGalleryImage[];
    isEditMode: boolean;
    onUpdate: (images: ProfileGalleryImage[]) => void;
    theme: TreeProfileTheme;
}

export function GallerySection({ images = [], isEditMode, onUpdate, theme }: GallerySectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<ProfileGalleryImage | null>(null);

    // Modal State
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(images.filter(img => img.id !== id));
    };

    const openEditModal = (image?: ProfileGalleryImage, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (image) {
            setEditingImage(image);
            setImageUrl(image.imageUrl);
            setCaption(image.caption || '');
        } else {
            setEditingImage(null);
            setImageUrl('');
            setCaption('');
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!imageUrl) return;

        if (editingImage) {
            onUpdate(images.map(img =>
                img.id === editingImage.id
                    ? { ...img, imageUrl, caption }
                    : img
            ));
        } else {
            const newImage: ProfileGalleryImage = {
                id: crypto.randomUUID(),
                imageUrl,
                caption
            };
            onUpdate([...images, newImage]);
        }
        setIsModalOpen(false);
    };

    if (!isEditMode && images.length === 0) return null;

    // Grid layout helper - subtle variations for visual interest
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

    return (
        <div className="w-full mb-8">
            {/* Section Header */}
            <motion.div
                className="flex items-center justify-between mb-4 px-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <h3
                        className="text-sm font-black uppercase tracking-widest text-white"
                        style={{
                            color: theme.primaryColor
                        }}
                    >
                        Gallery
                    </h3>
                </div>
                {isEditMode && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-xl"
                        onClick={(e) => openEditModal(undefined, e)}
                    >
                        <Plus className="w-3 h-3" /> Add
                    </Button>
                )}
            </motion.div>

            {images.length === 0 ? (
                <motion.div
                    onClick={(e) => openEditModal(undefined, e)}
                    className="aspect-video w-full rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/40 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all duration-300 gap-3 backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-cyan-500/20 blur-2xl" />
                        <ImageIcon className="w-10 h-10 relative z-10" />
                    </div>
                    <span className="text-sm font-medium">Create your visual story</span>
                </motion.div>
            ) : (
                /* Clean Grid Layout - Reference Image Style */
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
                                {/* Main Image Container */}
                                <div className="relative w-full h-full bg-linear-to-br from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden rounded-3xl">
                                    {/* Image */}
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

                                    {/* Dark Overlay on Hover */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Edit Mode Actions */}
                                    {isEditMode ? (
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-sm">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
                                                onClick={(e) => openEditModal(image, e)}
                                            >
                                                <Edit2 className="w-4 h-4 text-white" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-9 w-9 rounded-full backdrop-blur-xl border border-white/30 shadow-lg"
                                                onClick={(e) => handleDelete(image.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Caption Display - Non-Edit Mode */
                                        image.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                                <div className="backdrop-blur-xl bg-black/60 rounded-2xl px-3 py-2 border border-white/20">
                                                    <p className="text-xs text-white font-semibold truncate">
                                                        {image.caption}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Subtle Accent Color Overlay */}
                                    <div
                                        className="absolute inset-0 mix-blend-overlay opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at center, ${theme.primaryColor}, transparent 70%)`
                                        }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingImage ? 'Edit Photo' : 'Add New Photo'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                placeholder="https://..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Caption (Optional)</Label>
                            <Input
                                placeholder="Beautiful moment..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
