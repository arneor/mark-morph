'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Plus } from 'lucide-react';
import { CustomLink, TreeProfileTheme } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';
import { AddLinkModal } from './AddLinkModal';

interface LinkBlockProps {
    link: CustomLink;
    index: number;
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onEdit?: () => void;
}

export function LinkBlock({ link, index, theme, isEditMode, onEdit }: LinkBlockProps) {
    // Check if theme is likely light mode
    const isLightTheme = theme.textColor === '#000000' || theme.textColor === '#0f172a' || theme.textColor === '#831843';

    // Base styles based on theme.cardStyle
    const cardBaseStyles = {
        glass: isLightTheme ? 'bg-black/5 backdrop-blur-md border-black/10' : 'bg-white/10 backdrop-blur-md border-white/20',
        flat: isLightTheme ? 'bg-black/5 border-transparent' : 'bg-white/10 border-transparent',
        outline: isLightTheme ? 'bg-transparent border-black/20' : 'bg-transparent border-white/20',
        minimal: 'bg-transparent border-transparent hover:bg-white/5',
        solid: isLightTheme ? 'bg-white border-black/10' : 'bg-[#1a1a1a] border-white/10',
    };

    // Button shape styles
    const buttonShapeStyles = {
        rounded: 'rounded-2xl',
        pill: 'rounded-full',
        sharp: 'rounded-none',
        soft: 'rounded-[32px] rounded-bl-none', // Asymmetric 'leaf' shape
        glass: 'rounded-xl',
    };

    const styleClasses = {
        default: cardBaseStyles[theme.cardStyle || 'glass'],
        featured: `bg-gradient-to-r from-[${theme.primaryColor}]/20 to-purple-500/20 border-[${theme.primaryColor}]/50`,
        outline: 'bg-transparent border-white/40 hover:bg-white/5',
        gradient: '',
    };

    const gradientStyle = link.style === 'gradient' ? {
        background: `linear-gradient(135deg, ${theme.primaryColor}30, #A855F730)`,
        borderColor: `${theme.primaryColor}50`,
    } : {};

    return (
        <motion.a
            href={isEditMode ? undefined : link.url}
            target={isEditMode ? undefined : "_blank"}
            rel={isEditMode ? undefined : "noopener noreferrer"}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: index * 0.08,
                type: 'spring',
                stiffness: 200,
                damping: 20,
            }}
            whileHover={{
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group relative block w-full p-4 border transition-all duration-300',
                buttonShapeStyles[theme.buttonStyle || 'rounded'],
                'shadow-lg hover:shadow-xl',
                link.style !== 'gradient' && (styleClasses[link.style] || styleClasses.default),
                isEditMode && 'cursor-pointer hover:border-dashed hover:border-white/60',
            )}
            style={{
                ...gradientStyle,
                boxShadow: `0 4px 20px ${theme.primaryColor}10`,
            }}
            onClick={(e) => {
                if (isEditMode) {
                    e.preventDefault();
                    onEdit?.();
                }
            }}
        >
            {/* Hover glow effect */}
            <div
                className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                    buttonShapeStyles[theme.buttonStyle || 'rounded']
                )}
                style={{
                    boxShadow: `inset 0 0 30px ${theme.primaryColor}15, 0 0 30px ${theme.primaryColor}10`,
                }}
            />

            {/* Content */}
            <div className="relative flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: theme.textColor }}>
                        {link.title}
                    </h3>
                    {link.description && (
                        <p className="text-sm mt-0.5 truncate" style={{ color: theme.textColor, opacity: 0.7 }}>
                            {link.description}
                        </p>
                    )}
                </div>

                {/* Arrow icon */}
                <motion.div
                    className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center", isLightTheme ? "bg-black/10" : "bg-white/10")}
                    whileHover={{ scale: 1.1, rotate: -45 }}
                    transition={{ duration: 0.2 }}
                >
                    <ExternalLink className={cn("w-4 h-4 transition-colors", isLightTheme ? "text-black/70 group-hover:text-black" : "text-white/70 group-hover:text-white")} />
                </motion.div>
            </div>

            {/* Featured badge */}
            {link.style === 'featured' && (
                <div
                    className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        background: theme.primaryColor,
                        color: isLightTheme ? '#fff' : '#000',
                    }}
                >
                    Featured
                </div>
            )}

            {/* Edit mode overlay prompt */}
            {isEditMode && (
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20 backdrop-blur-[1px]",
                    buttonShapeStyles[theme.buttonStyle || 'rounded']
                )}>
                    <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Click to Edit
                    </span>
                </div>
            )}
        </motion.a>
    );
}

interface LinksSectionProps {
    links: CustomLink[];
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onUpdate?: (links: CustomLink[]) => void;
}

export function LinksSection({ links, theme, isEditMode, onUpdate }: LinksSectionProps) {
    const activeLinks = links.filter(l => l.isActive);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);

    // Check if theme is likely light mode
    const isLightTheme = theme.textColor === '#000000' || theme.textColor === '#0f172a' || theme.textColor === '#831843';

    const handleSave = (linkData: Partial<CustomLink>) => {
        if (!onUpdate) return;

        let newLinks = [...links];

        if (editingLink) {
            // Update existing
            newLinks = newLinks.map(l => l.id === editingLink.id ? { ...l, ...linkData } as CustomLink : l);
        } else {
            // Add new
            const newLink: CustomLink = {
                id: `link-${Date.now()}`,
                title: linkData.title || 'New Link',
                url: linkData.url || '#',
                description: linkData.description,
                style: linkData.style || 'default',
                isActive: true,
                ...linkData,
            } as CustomLink;
            newLinks.push(newLink);
        }

        onUpdate(newLinks);
        setEditingLink(null);
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (!onUpdate || !editingLink) return;
        const newLinks = links.filter(l => l.id !== editingLink.id);
        onUpdate(newLinks);
        setEditingLink(null);
        setIsModalOpen(false);
    };

    const openForAdd = () => {
        setEditingLink(null);
        setIsModalOpen(true);
    };

    const openForEdit = (link: CustomLink) => {
        setEditingLink(link);
        setIsModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
        >
            {/* Section header */}
            <div className="flex items-center justify-between px-1 mb-4">
                <h2
                    className="text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: theme.textColor, opacity: 0.5 }}
                >
                    🔗 Quick Links
                </h2>
                {isEditMode && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openForAdd}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold transition-colors border flex items-center gap-1",
                            isLightTheme
                                ? "bg-black/5 text-black/70 hover:bg-black/10 hover:text-black border-black/20"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20"
                        )}
                    >
                        <Plus className="w-3 h-3" /> Add Link
                    </motion.button>
                )}
            </div>

            {/* Links list */}
            <div className="space-y-3">
                {activeLinks.map((link, index) => (
                    <LinkBlock
                        key={link.id}
                        link={link}
                        index={index}
                        theme={theme}
                        isEditMode={isEditMode}
                        onEdit={() => openForEdit(link)}
                    />
                ))}
            </div>

            {/* Empty state for edit mode */}
            {isEditMode && activeLinks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-2xl border-2 border-dashed border-white/20 text-center"
                >
                    <p className="text-white/50 mb-3">No links added yet</p>
                    <button
                        onClick={openForAdd}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    >
                        Add Your First Link
                    </button>
                </motion.div>
            )}

            {/* Modal */}
            <AddLinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={editingLink ? handleDelete : undefined}
                initialData={editingLink}
                primaryColor={theme.primaryColor}
            />
        </motion.div>
    );
}
