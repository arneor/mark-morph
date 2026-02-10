
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Star, User } from 'lucide-react';
import { ProfileReview, TreeProfileTheme } from '@/lib/dummyTreeProfileData';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ReviewsSectionProps {
    reviews: ProfileReview[];
    isEditMode: boolean;
    onUpdate: (reviews: ProfileReview[]) => void;
    theme: TreeProfileTheme;
}

export function ReviewsSection({ reviews = [], isEditMode, onUpdate, theme }: ReviewsSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ProfileReview | null>(null);

    // Modal State
    const [reviewerName, setReviewerName] = useState('');
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [date, setDate] = useState('Just now');
    const [avatarUrl, setAvatarUrl] = useState('');

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(reviews.filter(r => r.id !== id));
    };

    const openEditModal = (review?: ProfileReview, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (review) {
            setEditingReview(review);
            setReviewerName(review.reviewerName);
            setRating(review.rating.toString());
            setComment(review.comment);
            setDate(review.date);
            setAvatarUrl(review.avatarUrl || '');
        } else {
            setEditingReview(null);
            setReviewerName('');
            setRating('5');
            setComment('');
            setDate('Just now');
            setAvatarUrl('');
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!reviewerName || !comment) return;

        if (editingReview) {
            onUpdate(reviews.map(r =>
                r.id === editingReview.id
                    ? { ...r, reviewerName, rating: parseInt(rating), comment, date, avatarUrl }
                    : r
            ));
        } else {
            const newReview: ProfileReview = {
                id: crypto.randomUUID(),
                reviewerName,
                rating: parseInt(rating),
                comment,
                date,
                avatarUrl
            };
            onUpdate([newReview, ...reviews]);
        }
        setIsModalOpen(false);
    };

    if (!isEditMode && reviews.length === 0) return null;

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-70" style={{ color: theme.textColor }}>
                    What People Say
                </h3>
                {isEditMode && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={(e) => openEditModal(undefined, e)}
                    >
                        <Plus className="w-3 h-3" /> Add Review
                    </Button>
                )}
            </div>

            {reviews.length === 0 ? (
                <div
                    onClick={(e) => openEditModal(undefined, e)}
                    className="w-full p-8 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/50 cursor-pointer hover:bg-white/5 transition-colors gap-2 text-center"
                >
                    <Star className="w-8 h-8" />
                    <span className="text-sm">Add customer testimonials</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            key={review.id}
                            className="relative p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-white/10">
                                        <AvatarImage src={review.avatarUrl} />
                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-sm font-bold" style={{ color: theme.textColor }}>{review.reviewerName}</h4>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-3 h-3 fill-current",
                                                        i < review.rating ? "text-yellow-400" : "text-white/20"
                                                    )}
                                                />
                                            ))}
                                            <span className="text-[10px] opacity-50 ml-2" style={{ color: theme.textColor }}>{review.date}</span>
                                        </div>
                                    </div>
                                </div>
                                {isEditMode && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-white/50 hover:text-white"
                                            onClick={(e) => openEditModal(review, e)}
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-red-400/50 hover:text-red-400"
                                            onClick={(e) => handleDelete(review.id, e)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <p className="mt-3 text-sm leading-relaxed opacity-80" style={{ color: theme.textColor }}>
                                &quot;{review.comment}&quot;
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingReview ? 'Edit Review' : 'Add Testimonial'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Reviewer Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rating</Label>
                                <Select value={rating} onValueChange={setRating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                                        <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                                        <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                                        <SelectItem value="2">⭐⭐ (2)</SelectItem>
                                        <SelectItem value="1">⭐ (1)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Avatar URL (Optional)</Label>
                            <Input
                                placeholder="https://..."
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date Label</Label>
                            <Input
                                placeholder="e.g. 2 days ago"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Comment</Label>
                            <Textarea
                                placeholder="Great service..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
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
