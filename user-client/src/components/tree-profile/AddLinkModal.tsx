import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { X, Trash2, Link as LinkIcon, Type, Layout, Star, Sparkles, LucideIcon } from 'lucide-react';
import { CustomLink, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import { validateGenericUrl } from '@/lib/validation';

// Client-side mount detection without useEffect setState
const emptySubscribe = () => () => { };
function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,   // client: mounted
        () => false    // server: not mounted
    );
}

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (linkData: Partial<CustomLink>) => void;
    onDelete?: () => void;
    initialData?: CustomLink | null;
    theme: TreeProfileTheme;
}

export function AddLinkModal({ isOpen, onClose, onSave, onDelete, initialData, theme }: AddLinkModalProps) {
    // Use key prop from parent to reset state when initialData changes
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [style, setStyle] = useState<CustomLink['style']>(initialData?.style || 'default');
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
    };


    const [error, setError] = useState<string | null>(null);

    // Reset error when inputs change
    if (error && url) setError(null); // Simple reset or use useEffect

    const handleSave = () => {
        if (!title || !url) return;

        const validation = validateGenericUrl(url);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid URL format');
            return;
        }

        onSave({ title, url: validation.formattedUrl, description, style, isActive: true });
        onClose();
    };

    const styleOptions: { id: CustomLink['style']; label: string; icon: LucideIcon }[] = [
        { id: 'default', label: 'Default', icon: Layout },
        { id: 'featured', label: 'Featured', icon: Star },
        { id: 'outline', label: 'Outline', icon: LinkIcon },
        { id: 'gradient', label: 'Gradient', icon: Sparkles },
    ];

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
                        "w-full max-w-sm border rounded-3xl p-6 shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-fade-in",
                        styles.modalBg
                    )}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={cn("font-bold text-lg", styles.text)}>
                            {initialData ? 'Edit Link' : 'Add New Link'}
                        </h3>
                        <button
                            onClick={onClose}
                            className={cn("p-2 rounded-full transition-colors", styles.closeBtn)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                Link Title
                            </label>
                            <div className="relative">
                                <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", styles.textDim)}>
                                    <Type className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. My Portfolio"
                                    className={cn(
                                        "w-full rounded-xl py-3 pl-10 pr-4 transition-all font-medium border focus:outline-none focus:ring-1",
                                        styles.inputBg,
                                        styles.text,
                                        styles.placeholder,
                                        isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                    )}
                                />
                            </div>
                        </div>

                        {/* URL / Smart Link */}
                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                URL / Phone / Email
                            </label>
                            <div className="relative">
                                <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", styles.textDim)}>
                                    <LinkIcon className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://... or phone number"
                                    className={cn(
                                        "w-full rounded-xl py-3 pl-10 pr-4 transition-all text-sm border focus:outline-none focus:ring-1",
                                        styles.inputBg,
                                        styles.text,
                                        styles.placeholder,
                                        isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                Description <span className="opacity-50 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a short description..."
                                rows={2}
                                className={cn(
                                    "w-full rounded-xl py-3 px-4 transition-all text-sm resize-none border focus:outline-none focus:ring-1",
                                    styles.inputBg,
                                    styles.text,
                                    styles.placeholder,
                                    isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                )}
                            />
                        </div>

                        {/* Style Selector */}
                        <div className="space-y-2">
                            <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.label)}>
                                Appearance
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {styleOptions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                                            style === s.id ? styles.optionBtnActive : styles.optionBtn
                                        )}
                                        style={style === s.id && s.id === 'gradient' ? {
                                            borderColor: theme.primaryColor,
                                            background: `linear-gradient(135deg, ${theme.primaryColor}20, transparent)`
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
                                    if (window.confirm("Are you sure you want to delete this link?")) {
                                        onDelete();
                                        onClose();
                                    }
                                }}
                                className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!title || !url}
                            className={cn(
                                "flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.2)]",
                                styles.primaryBtn
                            )}
                        >
                            {initialData ? 'Save Changes' : 'Create Link'}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
