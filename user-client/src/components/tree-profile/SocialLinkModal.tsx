'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { X, Trash2, Link as LinkIcon, Instagram, Facebook, Twitter, Youtube, Linkedin, Mail, Phone } from 'lucide-react';
import { SocialLink, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';

// Client-side mount detection without useEffect setState
const emptySubscribe = () => () => { };
function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,   // client: mounted
        () => false    // server: not mounted
    );
}

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
    theme: TreeProfileTheme;
}

export function SocialLinkModal({ isOpen, onClose, onSave, onDelete, initialData, theme }: SocialLinkModalProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<string>(initialData?.platform || 'instagram');
    const [url, setUrl] = useState(initialData?.url || '');
    const [label, setLabel] = useState(initialData?.label || '');
    const mounted = useIsMounted();

    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    // Dynamic Styles
    const styles = {
        modalBg: isLightTheme ? 'bg-white border-black/10' : 'bg-[#0f1016] border-white/10',
        inputBg: isLightTheme ? 'bg-black/5 border-black/10 focus:border-black/30' : 'bg-black/40 border-white/10 focus:border-white/30',
        text: isLightTheme ? 'text-black' : 'text-white',
        textMuted: isLightTheme ? 'text-black/60' : 'text-white/60',
        textDim: isLightTheme ? 'text-black/40' : 'text-white/40',
        placeholder: isLightTheme ? 'placeholder-black/40' : 'placeholder-white/40',
        closeBtn: isLightTheme ? 'bg-black/5 text-black/70 hover:text-black hover:bg-black/10' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20',
        primaryBtn: isLightTheme ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90',
        optionBtn: isLightTheme ? 'bg-transparent text-black/50 border-black/10 hover:bg-black/5 hover:text-black/80' : 'bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white/80',
        optionBtnActive: isLightTheme ? 'bg-black/10 text-black border-black/30' : 'bg-white/10 text-white border-white/30',
        label: isLightTheme ? 'text-black/40' : 'text-white/40',
        deleteBtn: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
    };

    const handleSave = () => {
        if (!url) return;
        onSave({ platform: selectedPlatform, url, label });
        onClose();
    };

    if (!mounted) return null;

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <div
                    className={cn(
                        "w-full max-w-sm border rounded-3xl p-6 shadow-2xl pointer-events-auto animate-fade-in",
                        styles.modalBg
                    )}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={cn("font-bold text-lg", styles.text)}>
                            {initialData ? 'Edit Social Link' : 'Add Social Link'}
                        </h3>
                        <button
                            onClick={onClose}
                            className={cn("p-2 rounded-full transition-colors", styles.closeBtn)}
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
                                    "aspect-square rounded-xl flex items-center justify-center transition-all border",
                                    selectedPlatform === p.id ? styles.optionBtnActive : styles.optionBtn
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
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                Link URL / Number
                            </label>
                            <div className="relative">
                                <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", styles.textDim)}>
                                    <LinkIcon className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder={selectedPlatform === 'email' ? 'hello@example.com' : 'https://...'}
                                    className={cn(
                                        "w-full border rounded-xl py-3 pl-10 pr-4 transition-all font-medium focus:outline-none focus:ring-1",
                                        styles.inputBg,
                                        styles.text,
                                        styles.placeholder,
                                        isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                Display Label <span className={cn("font-normal opacity-50")}>variable</span>
                            </label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="@username"
                                className={cn(
                                    "w-full border rounded-xl py-3 px-4 transition-all text-sm focus:outline-none focus:ring-1",
                                    styles.inputBg,
                                    styles.text,
                                    styles.placeholder,
                                    isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                )}
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
                                className={cn("p-3 rounded-xl transition-colors", styles.deleteBtn)}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!url}
                            className={cn(
                                "flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.2)]",
                                styles.primaryBtn
                            )}
                        >
                            {initialData ? 'Save Changes' : 'Add Link'}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
