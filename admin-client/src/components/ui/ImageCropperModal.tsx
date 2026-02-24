"use client";

import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    aspectRatio?: number;
    circularCrop?: boolean;
    onCropComplete: (croppedBlob: Blob) => void;
}

export function ImageCropperModal({
    isOpen,
    onClose,
    imageFile,
    aspectRatio = 1,
    circularCrop = false,
    onCropComplete
}: ImageCropperModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load image from file
    React.useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
            });
            reader.readAsDataURL(imageFile);
        } else {
            setImageSrc(null);
        }
    }, [imageFile]);

    const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsLoading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedBlob) {
                onCropComplete(croppedBlob);
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !imageFile) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/20 text-white p-0 overflow-hidden flex flex-col h-[80vh] sm:h-auto">
                <DialogHeader className="p-4 border-b border-white/10">
                    <DialogTitle>Edit Image</DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 min-h-[300px] w-full bg-black/50">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={onCropCompleteCallback}
                            onZoomChange={setZoom}
                            cropShape={circularCrop ? 'round' : 'rect'}
                            showGrid={false}
                            style={{
                                containerStyle: { background: '#000' },
                                cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.5)' }
                            }}
                        />
                    )}
                </div>

                <div className="p-4 space-y-4 bg-[#1a1a2e]">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-white/50" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="w-4 h-4 text-white/50" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            onClick={createCroppedImage}
                            disabled={isLoading}
                            className="bg-white text-black hover:bg-white/90"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-1" />
                            )}
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper function to create the cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                // reject(new Error('Canvas is empty'));
                console.error('Canvas is empty');
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95); // High quality JPEG
    });
}
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });
