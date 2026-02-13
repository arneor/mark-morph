import { useState, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Sparkles } from 'lucide-react';
import { CatalogCategory, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

// Client-side mount detection without useEffect setState
const emptySubscribe = () => () => { };
function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,   // client: mounted
        () => false    // server: not mounted
    );
}

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, emoji: string) => void;
    onDelete?: () => void;
    theme: TreeProfileTheme;
    initialData?: CatalogCategory | null;
}

export function AddCategoryModal({ isOpen, onClose, onSave, onDelete, theme, initialData }: AddCategoryModalProps) {
    // State initialized from props; parent uses key prop to remount with new data
    const [name, setName] = useState(initialData?.name || '');
    const [emoji, setEmoji] = useState(initialData?.emoji || '');
    const mounted = useIsMounted();
    const inputRef = useRef<HTMLInputElement>(null);

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
    };


    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim(), emoji.trim());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className={cn(
                                "w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col border relative",
                                styles.modalBg
                            )}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className={cn(
                                    "absolute top-4 right-4 p-2 rounded-full transition-colors z-10",
                                    styles.closeBtn
                                )}
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3",
                                        isLightTheme ? "bg-black text-white" : "bg-white text-black"
                                    )}>
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <h3 className={cn("text-xl font-bold", styles.text)}>
                                        {initialData ? 'Edit Category' : 'New Category'}
                                    </h3>
                                    <p className={cn("text-sm", styles.textMuted)}>
                                        {initialData ? 'Update category details' : 'Create a section for your menu items'}
                                    </p>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1", styles.textMuted)}>
                                            Category Name
                                        </label>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="e.g. Starters, Burgers..."
                                            className={cn(
                                                "w-full rounded-xl py-3 px-4 transition-all font-medium border focus:outline-none focus:ring-1 text-lg",
                                                styles.inputBg,
                                                styles.text,
                                                styles.placeholder,
                                                isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={cn("text-xs font-semibold uppercase tracking-wider pl-1 flex items-center gap-1", styles.textMuted)}>
                                            Emoji Icon <span className="opacity-50 font-normal lowercase">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <div className={cn("absolute left-4 top-1/2 -translate-y-1/2", styles.textDim)}>
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                value={emoji}
                                                onChange={(e) => setEmoji(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="🍔"
                                                maxLength={2}
                                                className={cn(
                                                    "w-full rounded-xl py-3 pl-11 pr-4 transition-all font-medium border focus:outline-none focus:ring-1 text-lg",
                                                    styles.inputBg,
                                                    styles.text,
                                                    styles.placeholder,
                                                    isLightTheme ? "focus:ring-black/30" : "focus:ring-white/30"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={!name.trim()}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                            styles.primaryBtn
                                        )}
                                    >
                                        {initialData ? 'Save Changes' : 'Create Category'}
                                    </button>

                                    {initialData && onDelete && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this category? All items in it will be hidden.')) {
                                                    onDelete();
                                                    onClose();
                                                }
                                            }}
                                            className="w-full py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Category
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
