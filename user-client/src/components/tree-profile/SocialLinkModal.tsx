'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Link as LinkIcon, Instagram, Facebook, Twitter, Youtube, Linkedin, Mail, Phone } from 'lucide-react';
import { SocialLink } from '@/lib/treeProfileTypes';
import { cn } from '@/lib/utils';

// Custom Icons
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const PLATFORMS: { id: SocialLink['platform']; label: string; icon: React.ReactNode }[] = [
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon /> },
    { id: 'twitter', label: 'Twitter', icon: <Twitter className="w-5 h-5" /> },
    { id: 'tiktok', label: 'TikTok', icon: <TikTokIcon /> },
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-5 h-5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-5 h-5" /> },
    { id: 'phone', label: 'Phone', icon: <Phone className="w-5 h-5" /> },
];

interface SocialLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (linkData: { platform: string; url: string; label?: string }) => void;
    onDelete?: () => void;
    initialData?: SocialLink | null;
}

export function SocialLinkModal({ isOpen, onClose, onSave, onDelete, initialData }: SocialLinkModalProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<string>(initialData?.platform || 'instagram');
    const [url, setUrl] = useState(initialData?.url || '');
    const [label, setLabel] = useState(initialData?.label || '');

    const handleSave = () => {
        if (!url) return;
        onSave({ platform: selectedPlatform, url, label });
        onClose();
    };

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
                            className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold text-lg">
                                    {initialData ? 'Edit Social Link' : 'Add Social Link'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Platform Grid */}
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPlatform(p.id)}
                                        className={cn(
                                            "aspect-square rounded-xl flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all border border-transparent",
                                            selectedPlatform === p.id && "bg-white/10 text-white border-white/20 shadow-lg shadow-white/5"
                                        )}
                                        title={p.label}
                                    >
                                        {p.icon}
                                    </button>
                                ))}
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        Link URL / Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder={selectedPlatform === 'email' ? 'hello@example.com' : 'https://...'}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider pl-1">
                                        Display Label <span className="text-white/20 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="@username"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-sm"
                                    />
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
                                    disabled={!url}
                                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {initialData ? 'Save Changes' : 'Add Link'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
