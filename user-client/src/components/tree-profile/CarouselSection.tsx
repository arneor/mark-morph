'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { Plus, Trash2, Edit2, ImageIcon, Sparkles } from 'lucide-react';
import { ProfileBanner, TreeProfileTheme } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';
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

interface CarouselSectionProps {
    banners: ProfileBanner[];
    isEditMode: boolean;
    onUpdate: (banners: ProfileBanner[]) => void;
    theme: TreeProfileTheme;
}

export function CarouselSection({ banners = [], isEditMode, onUpdate, theme }: CarouselSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<ProfileBanner | null>(null);
    const [direction, setDirection] = useState(0);
    const scrollTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Modal State
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    // Parallax effect with spring physics for smooth motion
    const dragX = useMotionValue(0);
    const parallaxX = useSpring(dragX, { stiffness: 150, damping: 30, mass: 0.5 });

    const activeBanners = isEditMode ? banners : banners.filter(b => b.isActive);

    // Auto-advance carousel
    useEffect(() => {
        if (activeBanners.length <= 1 || isEditMode) return;

        const startTimer = () => {
            scrollTimerRef.current = setInterval(() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }, 6000); // 6 seconds per slide
        };

        startTimer();

        return () => {
            if (scrollTimerRef.current) {
                clearInterval(scrollTimerRef.current);
            }
        };
    }, [activeBanners.length, isEditMode]);

    // Restart timer after manual navigation
    const restartTimer = () => {
        if (scrollTimerRef.current) {
            clearInterval(scrollTimerRef.current);
        }
        if (!isEditMode && activeBanners.length > 1) {
            scrollTimerRef.current = setInterval(() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }, 6000);
        }
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 50;

        // Reset parallax after drag
        dragX.set(0);

        if (info.offset.x > swipeThreshold) {
            // Swiped right - go to previous
            setDirection(-1);
            setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
            restartTimer();
        } else if (info.offset.x < -swipeThreshold) {
            // Swiped left - go to next
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            restartTimer();
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(banners.filter(b => b.id !== id));
        if (currentIndex >= activeBanners.length - 1) {
            setCurrentIndex(Math.max(0, activeBanners.length - 2));
        }
    };

    const openEditModal = (banner?: ProfileBanner, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (banner) {
            setEditingBanner(banner);
            setTitle(banner.title || '');
            setImageUrl(banner.imageUrl);
            setLinkUrl(banner.linkUrl || '');
        } else {
            setEditingBanner(null);
            setTitle('');
            setImageUrl('');
            setLinkUrl('');
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!imageUrl) return;

        if (editingBanner) {
            onUpdate(banners.map(b =>
                b.id === editingBanner.id
                    ? { ...b, title, imageUrl, linkUrl }
                    : b
            ));
        } else {
            const newBanner: ProfileBanner = {
                id: crypto.randomUUID(),
                imageUrl,
                title,
                linkUrl,
                isActive: true
            };
            onUpdate([...banners, newBanner]);
        }
        setIsModalOpen(false);
    };

    if (!isEditMode && activeBanners.length === 0) return null;

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        })
    };

    return (
        <div className="relative w-full mb-8">
            {/* Section Header */}
            <motion.div
                className="flex items-center justify-between mb-4 px-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    <h3
                        className="text-sm font-black uppercase tracking-widest text-white"
                        style={{
                            color: theme.primaryColor
                        }}
                    >
                        Featured
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

            {activeBanners.length === 0 ? (
                <motion.div
                    onClick={(e) => openEditModal(undefined, e)}
                    className="aspect-video w-full rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/40 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all duration-300 gap-3 backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 blur-2xl" />
                        <ImageIcon className="w-10 h-10 relative z-10" />
                    </div>
                    <span className="text-sm font-medium">Add featured content</span>
                </motion.div>
            ) : (
                <div className="relative touch-pan-y">
                    {/* Ambient Glow */}
                    <div
                        className="absolute -inset-6 opacity-20 blur-3xl transition-opacity duration-1000"
                        style={{
                            background: `radial-gradient(circle, ${theme.primaryColor}, transparent 70%)`
                        }}
                    />

                    {/* Main Carousel with Parallax */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black">
                        {/* Subtle Border Glow */}
                        <div
                            className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none z-20"
                            style={{
                                boxShadow: `inset 0 0 0 1px ${theme.primaryColor}60`
                            }}
                        />

                        {/* Slides with Parallax Background */}
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={activeBanners[currentIndex].id}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 }
                                }}
                                drag={!isEditMode && activeBanners.length > 1 ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDrag={(e, info) => {
                                    // Update parallax in real-time during drag
                                    dragX.set(info.offset.x * 0.3);
                                }}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                            >
                                {/* Parallax Background Layer - Moves slower */}
                                <motion.div
                                    className="absolute inset-0 scale-110"
                                    style={{
                                        x: parallaxX,
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activeBanners[currentIndex].imageUrl}
                                        alt={activeBanners[currentIndex].title || 'Banner'}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </motion.div>

                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none z-10"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.primaryColor}30, transparent 60%)`
                                    }}
                                />

                                {/* Content Layer - Static (no parallax) */}
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    {activeBanners[currentIndex].title && (
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.5 }}
                                                className="backdrop-blur-2xl bg-black/40 rounded-2xl p-4 border border-white/20"
                                            >
                                                <h4 className="text-white font-black text-xl md:text-2xl drop-shadow-2xl leading-tight">
                                                    {activeBanners[currentIndex].title}
                                                </h4>
                                                <div
                                                    className="h-1 w-16 rounded-full mt-2"
                                                    style={{ background: theme.primaryColor }}
                                                />
                                            </motion.div>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Controls */}
                                {isEditMode && (
                                    <div className="absolute top-3 right-3 flex gap-2 z-20 pointer-events-auto">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20 backdrop-blur-xl"
                                            onClick={(e) => openEditModal(activeBanners[currentIndex], e)}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full backdrop-blur-xl border border-white/20"
                                            onClick={(e) => handleDelete(activeBanners[currentIndex].id, e)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Indicators */}
                        {activeBanners.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
                                {activeBanners.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={cn(
                                            "h-1 rounded-full backdrop-blur-xl transition-all duration-500",
                                            idx === currentIndex ? "w-8" : "w-1"
                                        )}
                                        style={{
                                            background: idx === currentIndex
                                                ? theme.primaryColor
                                                : 'rgba(255, 255, 255, 0.3)'
                                        }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Swipe Hint */}
                        {!isEditMode && activeBanners.length > 1 && currentIndex === 0 && (
                            <motion.div
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-white/60 text-xs pointer-events-none z-20"
                                initial={{ opacity: 1, x: 0 }}
                                animate={{ opacity: 0, x: -10 }}
                                transition={{ delay: 2, duration: 1 }}
                            >
                                <span className="flex items-center gap-1 backdrop-blur-xl bg-black/40 px-3 py-1.5 rounded-full border border-white/20">
                                    <motion.span
                                        animate={{ x: [-3, 3, -3] }}
                                        transition={{ repeat: 3, duration: 1.5 }}
                                    >
                                        ←
                                    </motion.span>
                                    Swipe
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
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
                            <Label>Title (Optional)</Label>
                            <Input
                                placeholder="Special Offer..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Link URL (Optional)</Label>
                            <Input
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
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
