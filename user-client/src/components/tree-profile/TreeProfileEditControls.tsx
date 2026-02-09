'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Save, X, Palette, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TreeProfileEditControlsProps {
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    hasChanges: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onOpenTheme?: () => void;
}

export function TreeProfileEditControls({
    isEditMode,
    setIsEditMode,
    hasChanges,
    onSave,
    onDiscard,
    onOpenTheme,
}: TreeProfileEditControlsProps) {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const businessId = params.businessId as string;

    const handleSave = () => {
        onSave();
        toast({
            title: '✨ Changes Saved!',
            description: 'Your Tree Profile has been updated successfully.',
        });
    };

    const handleBack = () => {
        if (hasChanges) {
            const confirmExit = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!confirmExit) return;
        }
        router.push(`/dashboard/${businessId}`);
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 inset-x-0 max-w-md mx-auto z-50 pointer-events-none"
            >
                <div className="flex items-center justify-between p-4 pointer-events-auto">
                    {/* Back button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Right side controls - Edit Mode Toggle */}
                    <Button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`h-10 px-4 rounded-full font-semibold transition-all shadow-lg ${isEditMode
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
                        <div className="bg-[#9EE53B]/20 backdrop-blur-xl border border-[#9EE53B]/30 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white drop-shadow-md tracking-wide">
                                    Edit Mode
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {onOpenTheme && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={onOpenTheme}
                                        className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 rounded-full"
                                        title="Customize Theme"
                                    >
                                        <Palette className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onDiscard}
                                    className="h-8 px-3 text-white hover:text-white hover:bg-white/20 rounded-lg"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                    className="h-8 px-4 bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90 disabled:opacity-50 font-bold rounded-lg shadow-sm"
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fixed Bottom Save Bar (when unsaved changes exist in edit mode) */}
            <AnimatePresence>
                {isEditMode && hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-50"
                    >
                        <div className="bg-black/60 backdrop-blur-2xl border-t border-white/10 p-4">
                            <Button
                                onClick={handleSave}
                                className="w-full h-14 text-lg font-bold rounded-2xl bg-[#9EE53B] text-[#222] hover:bg-[#9EE53B]/90 shadow-[0_0_20px_rgba(158,229,59,0.3)] transition-all hover:shadow-[0_0_30px_rgba(158,229,59,0.5)]"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Publish Changes
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
