import { motion } from "framer-motion";
import { Star, Pencil, ExternalLink, Check, X, Link } from "lucide-react";
import { useState } from "react";
import { useEditMode } from "./EditModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableReviewSectionProps {
    googlePlaceUrl: string;
    onGoogleUrlChange: (url: string) => void;
}

export function EditableReviewSection({
    googlePlaceUrl,
    onGoogleUrlChange,
}: EditableReviewSectionProps) {
    const { isEditMode, setHasUnsavedChanges } = useEditMode();
    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState(googlePlaceUrl);

    const handleSave = () => {
        onGoogleUrlChange(tempUrl);
        setHasUnsavedChanges(true);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempUrl(googlePlaceUrl);
        setIsEditing(false);
    };

    const handleOpenReview = () => {
        if (googlePlaceUrl) {
            window.open(googlePlaceUrl, "_blank", "noopener,noreferrer");
        }
    };

    // Only show if there's a URL or in edit mode
    if (!googlePlaceUrl && !isEditMode) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
        >
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#FFD93D]" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                    Google Reviews
                </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                {/* Edit Mode: Show input field */}
                {isEditMode ? (
                    <div className="space-y-3">
                        <p className="text-white/70 text-sm">
                            Add your Google Business Profile link so customers can leave reviews
                        </p>

                        {!isEditing ? (
                            <div
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors group"
                                onClick={() => {
                                    setTempUrl(googlePlaceUrl);
                                    setIsEditing(true);
                                }}
                            >
                                <Link className="w-5 h-5 text-white/50" />
                                <div className="flex-1 min-w-0">
                                    {googlePlaceUrl ? (
                                        <span className="text-white text-sm truncate block">
                                            {googlePlaceUrl}
                                        </span>
                                    ) : (
                                        <span className="text-white/40 text-sm">
                                            Click to add Google Business link...
                                        </span>
                                    )}
                                </div>
                                <Pencil className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Input
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://g.page/your-business or Google Maps link"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        className="bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        className="text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* View Mode: Show the review CTA button */
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <Star className="w-5 h-5 text-[#FFD93D]" />
                            <span className="text-white font-bold">
                                Enjoying your experience?
                            </span>
                        </div>
                        <p className="text-white/70 text-sm">
                            Leave a review and help others discover us!
                        </p>
                        <Button
                            variant="ghost"
                            className="h-10 px-6 rounded-full text-white/90 hover:text-white hover:bg-white/10 border border-white/20 text-sm font-semibold"
                            onClick={handleOpenReview}
                            disabled={!googlePlaceUrl}
                        >
                            <Star className="w-4 h-4 mr-2 text-[#FFD93D]" />
                            Leave a Google Review
                            <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
