'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Link as LinkIcon, Type, Layout, Star, Sparkles, LucideIcon } from 'lucide-react';
import { CustomLink } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (linkData: Partial<CustomLink>) => void;
    onDelete?: () => void;
    initialData?: CustomLink | null;
    primaryColor?: string;
}

export function AddLinkModal({ isOpen, onClose, onSave, onDelete, initialData, primaryColor = '#9EE53B' }: AddLinkModalProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [style, setStyle] = useState<CustomLink['style']>(initialData?.style || 'default');

    const handleSave = () => {
        if (!title || !url) return;
        onSave({ title, url, description, style, isActive: true });
        onClose();
    };

    const styles: { id: CustomLink['style']; label: string; icon: LucideIcon }[] = [
        { id: 'default', label: 'Default', icon: Layout },
        { id: 'featured', label: 'Featured', icon: Star },
        { id: 'outline', label: 'Outline', icon: LinkIcon },
        { id: 'gradient', label: 'Gradient', icon: Sparkles },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-70 p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="w-full max-w-sm bg-[#0f1016] border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold text-lg">
                                    {initialData ? 'Edit Link' : 'Add New Link'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        Link Title
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                            <Type className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. My Portfolio"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        URL
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        Description <span className="text-white/20 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a short description..."
                                        rows={2}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm resize-none"
                                    />
                                </div>

                                {/* Style Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        Appearance
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {styles.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setStyle(s.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                                                    style === s.id
                                                        ? "bg-white/10 text-white border-white/30"
                                                        : "bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white/80"
                                                )}
                                                style={style === s.id && s.id === 'gradient' ? {
                                                    borderColor: primaryColor,
                                                    background: `linear-gradient(135deg, ${primaryColor}20, transparent)`
                                                } : {}}
                                            >
                                                <s.icon className="w-4 h-4" />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                {initialData && onDelete && (
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            onClose();
                                        }}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={!title || !url}
                                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                >
                                    {initialData ? 'Save Changes' : 'Create Link'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
