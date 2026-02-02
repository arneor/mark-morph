import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil,
    Eye,
    Save,
    X,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditMode } from "./EditModeContext";
import { useRouter } from "next/navigation";

interface ProfileEditControlsProps {
    onSave: () => void;
    businessId: string;
}

export function ProfileEditControls({
    onSave,
    businessId,
}: ProfileEditControlsProps) {
    const {
        isEditMode,
        toggleEditMode,
        hasUnsavedChanges,
        isSaving,
    } = useEditMode();
    const router = useRouter();

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmExit = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!confirmExit) return;
        }
        // Navigate to business dashboard (correct route)
        router.push(`/dashboard/${businessId}`);
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 inset-x-0 max-w-md mx-auto z-50"
            >
                <div className="flex items-center justify-between p-4">
                    {/* Back button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Right side controls - Edit Mode Toggle only */}
                    <Button
                        onClick={toggleEditMode}
                        className={`h-10 px-4 rounded-full font-semibold transition-all ${isEditMode
                            ? "bg-white text-[#222] hover:bg-white/90"
                            : "bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90"
                            }`}
                    >
                        {isEditMode ? (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </>
                        ) : (
                            <>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Edit Mode Banner */}
            <AnimatePresence>
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-16 inset-x-0 max-w-md mx-auto z-40 px-4"
                    >
                        <div className="bg-[#9EE53B]/20 backdrop-blur-sm border border-[#9EE53B]/30 rounded-2xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-[#9EE53B]" />
                                <span className="text-sm font-medium text-white">
                                    Edit Mode
                                    {hasUnsavedChanges && (
                                        <span className="text-[#FFD93D] ml-2">• Unsaved changes</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={toggleEditMode}
                                    className="h-8 px-3 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onSave}
                                    disabled={!hasUnsavedChanges || isSaving}
                                    className="h-8 px-4 bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-1" />
                                            Publish
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fixed Bottom Save Bar (when unsaved changes exist in edit mode) */}
            <AnimatePresence>
                {isEditMode && hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-50"
                    >
                        <div className="bg-black/60 backdrop-blur-2xl border-t border-white/10 p-4">
                            <Button
                                onClick={onSave}
                                disabled={isSaving}
                                className="w-full h-14 text-lg font-bold rounded-2xl bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Publishing Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Publish Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
