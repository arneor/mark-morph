'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";
interface GallerySectionProps {
    images: ProfileGalleryImage[];
    isEditMode: boolean;
    onUpdate: (images: ProfileGalleryImage[]) => void;
    theme: TreeProfileTheme;
}

export function GallerySection({
    images = [],
    isEditMode,
    onUpdate,
    theme
}: GallerySectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingImage, setEditingImage] = useState<ProfileGalleryImage | null>(null);

    // State for gallery items (merging props + fetched)
    const [galleryItems, setGalleryItems] = useState<ProfileGalleryImage[]>(images);

    // Image Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<File | null>(null);

    const MAX_IMAGES = 100;

    // Sync props to state if props change (e.g. initial load or edit update)
    useEffect(() => {
        setGalleryItems(images);
    }, [images]);

    // ---- Handlers (Upload, Edit, Delete) ----

    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        // Edit mode manual limit check (client side only)
        if (galleryItems.length + files.length > MAX_IMAGES) {
            alert(`Maximum ${MAX_IMAGES} gallery images allowed.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (files.length === 1) {
            setImageToCrop(files[0]);
            setIsCropperOpen(true);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const newImages: ProfileGalleryImage[] = files.map((file) => ({
            id: crypto.randomUUID(),
            imageUrl: URL.createObjectURL(file), // Create temporary preview URL
            caption: file.name.replace(/\.[^/.]+$/, ""),
            file: file // Store file for batch upload later
        }));

        const updated = [...galleryItems, ...newImages];
        setGalleryItems(updated);
        onUpdate(updated); // Propagate to parent state (Zustand)

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "cropped-gallery.jpg", { type: "image/jpeg" });

        const newImage: ProfileGalleryImage = {
            id: crypto.randomUUID(),
            imageUrl: URL.createObjectURL(file),
            caption: 'New Image',
            file: file
        };

        const updated = [...galleryItems, newImage];
        setGalleryItems(updated);
        onUpdate(updated);
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const updated = galleryItems.filter(img => img.id !== id);

        // Revoke Object URL if it's a pending file to free memory
        const deletedItem = galleryItems.find(img => img.id === id);
        if (deletedItem?.file && deletedItem.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(deletedItem.imageUrl);
        }

        setGalleryItems(updated);
        onUpdate(updated);
    };

    const handleEditImage = (image: ProfileGalleryImage, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingImage({ ...image });
    };

    const handleSaveEdit = () => {
        if (!editingImage) return;
        const updated = galleryItems.map(img => img.id === editingImage.id ? editingImage : img);
        setGalleryItems(updated);
        onUpdate(updated);
        setEditingImage(null);
    };

    if (!isEditMode && galleryItems.length === 0) return null;

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
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <h3
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: theme.textColor, opacity: 0.8 }}
                    >
                        {isEditMode ? `Gallery (${galleryItems.length})` : "GALLERY"}
                    </h3>
                </div>
                {isEditMode && (
                    <Button
                        size="sm"
                        onClick={handleAddImage}
                        className="h-7 text-xs gap-1 rounded-full"
                        style={{
                            backgroundColor: theme.primaryColor,
                            color: ['#FFFFFF', '#F5F5F5'].includes(theme.backgroundColor) ? '#FFFFFF' : '#000000'
                        }}
                    >
                        <Plus className="w-3 h-3" /> Add Post
                    </Button>
                )}
            </div>

            {/* UNIFIED GRID LAYOUT (Both Edit & View Modes) */}
            <div className="grid grid-cols-2 gap-3">
                {galleryItems.map((image) => (
                    <GalleryCard
                        key={image.id}
                        image={image}
                        isEditMode={isEditMode}
                        onDelete={(e) => handleDelete(image.id, e)}
                        onEdit={(e) => handleEditImage(image, e)}
                    />
                ))}

                {isEditMode && (
                    /* Add New Placeholder */
                    <div
                        onClick={handleAddImage}
                        className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all text-center p-4 hover:opacity-70 active:scale-95"
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

            {/* Empty State for View Mode */}
            {!isEditMode && galleryItems.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-white/40 gap-3 bg-white/5 rounded-xl">
                    <ImageIcon className="w-10 h-10Opacity-50" />
                    <span className="text-sm">No images yet</span>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Photo</DialogTitle>
                    </DialogHeader>
                    {editingImage && (
                        <div className="space-y-4">
                            <div className="aspect-square rounded-lg overflow-hidden bg-black/30 relative border border-white/10 w-1/2 mx-auto">
                                <Image
                                    src={editingImage.imageUrl}
                                    alt={editingImage.caption || 'Edit preview'}
                                    fill
                                    sizes="200px"
                                    className="object-cover"
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

            {/* Image Cropper Modal */}
            <ImageCropperModal
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                imageFile={imageToCrop}
                aspectRatio={1}
                circularCrop={false}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}

// Simple Gallery Card (Unified)
function GalleryCard({
    image,
    isEditMode,
    onDelete,
    onEdit,
}: {
    image: ProfileGalleryImage;
    isEditMode: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDelete?: (e: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit?: (e: any) => void
}) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-white/10 border border-white/20 shadow-sm group aspect-square w-full transition-transform active:scale-95">
            <Image
                src={image.imageUrl}
                alt={image.caption || 'Gallery thumbnail'}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
            />
            {/* Minimal Overlay for Caption */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                {image.caption && (
                    <p className="text-white text-xs font-medium truncate w-full shadow-sm">
                        {image.caption}
                    </p>
                )}
            </div>

            {/* Edit Mode Controls */}
            {isEditMode && (
                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-100 mobile:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10">
                        <Pencil className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={onDelete} className="w-7 h-7 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center hover:bg-red-600 transition-colors border border-white/10">
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>
            )}
        </div>
    );
}
