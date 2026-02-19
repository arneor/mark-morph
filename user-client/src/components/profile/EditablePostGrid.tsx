import { useRef, useState } from "react";
import React from "react";

import {
    Upload,
    Plus,
    Trash2,
    Star,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Pencil,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SplashCarousel } from "@/components/SplashCarousel";
import { useEditMode } from "./EditModeContext";

export interface PostItem {
    id: string;
    type: "image" | "banner";
    url: string;
    title: string;
    isFeatured: boolean;
    s3Key?: string;
    file?: File;
}

interface EditablePostGridProps {
    posts: PostItem[];
    onPostsChange: (posts: PostItem[]) => void;
    maxPosts?: number;
    businessId: string;
}

export function EditablePostGrid({
    posts,
    onPostsChange,
    maxPosts = 10,
}: EditablePostGridProps) {
    const { isEditMode, setHasUnsavedChanges } = useEditMode();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [editingPost, setEditingPost] = useState<PostItem | null>(null);

    const handleAddPost = () => {
        fileInputRef.current?.click();
    };

    const handleAddBanner = () => {
        bannerInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleFiles(e.target.files);
    };

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleFiles(e.target.files, true);
    };

    const handleFiles = (files: FileList, isBanner = false) => {
        const featuredCount = posts.filter(p => p.isFeatured).length;
        const regularCount = posts.filter(p => !p.isFeatured).length;

        const currentCount = isBanner ? featuredCount : regularCount;
        const maxLimit = isBanner ? 3 : maxPosts;

        if (currentCount >= maxLimit) {
            alert(`Maximum ${maxLimit} ${isBanner ? 'banners' : 'gallery images'} allowed.`);
            // Clear inputs immediately
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (bannerInputRef.current) bannerInputRef.current.value = "";
            return;
        }

        const newPosts: PostItem[] = [];
        Array.from(files).forEach((file) => {
            // Check against remaining slots
            if (currentCount + newPosts.length >= maxLimit) return;

            const url = URL.createObjectURL(file);
            newPosts.push({
                id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: "image",
                url,
                title: file.name.replace(/\.[^/.]+$/, ""),
                isFeatured: isBanner,
                file: file
            });
        });

        if (newPosts.length > 0) {
            onPostsChange([...posts, ...newPosts]);
            setHasUnsavedChanges(true);
        }

        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (bannerInputRef.current) bannerInputRef.current.value = "";
    };

    const handleDelete = (id: string) => {
        onPostsChange(posts.filter((p) => p.id !== id));
        setHasUnsavedChanges(true);
    };

    const handleToggleFeatured = (id: string) => {
        onPostsChange(
            posts.map((p) =>
                p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );
        setHasUnsavedChanges(true);
    };

    const handleMoveLeft = (index: number, isFeatured: boolean) => {
        const arr = isFeatured ? [...featuredPosts] : [...regularPosts];
        if (index <= 0) return;
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        const other = isFeatured ? regularPosts : featuredPosts;
        onPostsChange(isFeatured ? [...arr, ...other] : [...other, ...arr]);
        setHasUnsavedChanges(true);
    };

    const handleMoveRight = (index: number, isFeatured: boolean) => {
        const arr = isFeatured ? [...featuredPosts] : [...regularPosts];
        if (index >= arr.length - 1) return;
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
        const other = isFeatured ? regularPosts : featuredPosts;
        onPostsChange(isFeatured ? [...arr, ...other] : [...other, ...arr]);
        setHasUnsavedChanges(true);
    };

    const handleEditPost = (post: PostItem) => {
        setEditingPost({ ...post });
    };

    const handleSaveEdit = () => {
        if (!editingPost) return;
        onPostsChange(
            posts.map((p) => (p.id === editingPost.id ? editingPost : p))
        );
        setHasUnsavedChanges(true);
        setEditingPost(null);
    };

    const featuredPosts = posts.filter((p) => p.isFeatured);
    const regularPosts = posts.filter((p) => !p.isFeatured);

    return (
        <div className="space-y-4">
            {/* Featured Posts Section */}
            {(featuredPosts.length > 0 || isEditMode) && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-[#FFD93D]" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                            {isEditMode ? `Featured (${featuredPosts.length}/3)` : "Featured"}
                        </span>
                    </div>
                    {isEditMode ? (
                        <div className="space-y-2">
                            <p className="text-xs text-white/50 px-1">
                                Use arrows to reorder.
                            </p>

                            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 touch-auto">
                                {featuredPosts.length < 3 && (
                                    <div
                                        onClick={handleAddBanner}
                                        className="w-72 shrink-0 aspect-video rounded-2xl border-2 border-dashed border-white/30 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                            <Upload className="w-5 h-5 text-white/50" />
                                        </div>
                                        <span className="text-xs text-white/50 font-medium text-center px-2">
                                            Add Offer Banner
                                        </span>
                                    </div>
                                )}

                                {featuredPosts.map((post, index) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        isEditMode={isEditMode}
                                        onDelete={() => handleDelete(post.id)}
                                        onEdit={() => handleEditPost(post)}
                                        onToggleFeatured={() => handleToggleFeatured(post.id)}
                                        isFeaturedSection
                                        canMoveLeft={index > 0}
                                        canMoveRight={index < featuredPosts.length - 1}
                                        onMoveLeft={() => handleMoveLeft(index, true)}
                                        onMoveRight={() => handleMoveRight(index, true)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <SplashCarousel
                                campaigns={featuredPosts.map(p => ({
                                    id: "preview-" + p.id,
                                    title: p.title,
                                    mediaUrl: p.url,
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

            {/* Regular Posts Grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#9EE53B]" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                            {isEditMode ? `Gallery (${regularPosts.length}/${maxPosts})` : "Gallery"}
                        </span>
                    </div>
                    {isEditMode && regularPosts.length < maxPosts && (
                        <Button
                            size="sm"
                            onClick={handleAddPost}
                            className="h-8 rounded-full bg-[#9EE53B] hover:bg-[#9EE53B]/90 text-[#222] text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Post
                        </Button>
                    )}
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleBannerFileChange}
                />

                {/* Content Grid - Static Layout for Stability */}
                <div className="grid grid-cols-2 gap-3">
                    {regularPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isEditMode={isEditMode}
                            onDelete={() => handleDelete(post.id)}
                            onEdit={() => handleEditPost(post)}
                            onToggleFeatured={() => handleToggleFeatured(post.id)}
                        />
                    ))}

                    {/* Add New Placeholder - Grid Style */}
                    {isEditMode && regularPosts.length < maxPosts && (
                        <div
                            onClick={handleAddPost}
                            className="aspect-4/5 rounded-2xl border-2 border-dashed border-white/30 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/50 transition-all"
                        >
                            <Upload className="w-8 h-8 text-white/50 mb-2" />
                            <span className="text-xs text-white/50 font-medium">
                                Upload New
                            </span>
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {posts.length === 0 && !isEditMode && (
                    <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">No posts yet</p>
                    </div>
                )}
            </div>

            {/* Edit Post Dialog */}
            <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
                <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    {editingPost && (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-black/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={editingPost.url}
                                    alt={editingPost.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-white/80">Title</Label>
                                    <Input
                                        value={editingPost.title}
                                        onChange={(e) =>
                                            setEditingPost({ ...editingPost, title: e.target.value })
                                        }
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant={editingPost.isFeatured ? "default" : "outline"}
                                        size="sm"
                                        onClick={() =>
                                            setEditingPost({
                                                ...editingPost,
                                                isFeatured: !editingPost.isFeatured,
                                            })
                                        }
                                        className={
                                            editingPost.isFeatured
                                                ? "bg-[#FFD93D] text-[#222] hover:bg-[#FFD93D]/90"
                                                : "border-white/20 text-white hover:bg-white/10"
                                        }
                                    >
                                        <Star
                                            className={`w-4 h-4 mr-1 ${editingPost.isFeatured ? "fill-current" : ""
                                                }`}
                                        />
                                        {editingPost.isFeatured ? "Featured" : "Make Featured"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditingPost(null)}
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

// Individual Post Card Component
interface PostCardProps {
    post: PostItem;
    isEditMode: boolean;
    isFeaturedSection?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
    onToggleFeatured?: () => void;
    canMoveLeft?: boolean;
    canMoveRight?: boolean;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
}

function PostCard({
    post,
    isEditMode,
    isFeaturedSection,
    onDelete,
    onEdit,
    onToggleFeatured,
    canMoveLeft,
    canMoveRight,
    onMoveLeft,
    onMoveRight,
}: PostCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl group animate-fade-in hover:scale-[1.02] transition-transform ${isFeaturedSection ? "w-72 shrink-0" : "w-full"
                }`}
        >
            <div className={isFeaturedSection ? "aspect-video" : "aspect-4/5"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={post.url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2">
                    {post.title}
                </div>
                <div className="flex items-center gap-2">
                    {post.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFD93D]/30 text-[#FFD93D] flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                        </span>
                    )}
                </div>
            </div>

            {/* Edit Mode Controls */}
            {isEditMode && (
                <>
                    {/* Move buttons */}
                    {isFeaturedSection && (
                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                            {canMoveLeft && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveLeft?.(); }}
                                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                            )}
                            {canMoveRight && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveRight?.(); }}
                                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <button
                            onClick={onToggleFeatured}
                            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                            <Star
                                className={`w-4 h-4 ${post.isFeatured ? "text-[#FFD93D] fill-current" : "text-white"
                                    }`}
                            />
                        </button>
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
                    <div className="absolute inset-0 border-2 border-[#9EE53B]/50 rounded-2xl pointer-events-none" />
                </>
            )}
        </div>
    );
}
