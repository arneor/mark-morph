'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Plus } from 'lucide-react';
import { CustomLink, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import { AddLinkModal } from './AddLinkModal';

interface LinkBlockProps {
    link: CustomLink;
    index: number;
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onEdit?: () => void;
}

const LinkBlockComponent = ({ link, index, theme, isEditMode, onEdit }: LinkBlockProps) => {
    // Check if theme is likely light mode
    const isLightTheme = isColorExclusivelyDark(theme.textColor);

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

    const styleClasses: Record<string, string> = {
        default: cardBaseStyles[theme.cardStyle || 'glass'],
        featured: `border-white/50`, // Background handled via inline style for CSS var support
        outline: 'bg-transparent border-white/40 hover:bg-white/5',
        gradient: '',
    };

    const gradientStyle = link.style === 'gradient' ? {
        background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, #A855F7 30%, transparent))`,
        borderColor: `color-mix(in srgb, var(--primary) 50%, transparent)`,
    } : {};

    const featuredStyle = link.style === 'featured' ? {
        background: `linear-gradient(to right, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, #a855f7 20%, transparent))`,
        borderColor: `color-mix(in srgb, var(--primary) 50%, transparent)`,
    } : {};

    return (
        <motion.a
            href={isEditMode ? undefined : (link.url.match(/^https?:\/\//) ? link.url : `https://${link.url}`)}
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
                link.style !== 'gradient' && link.style !== 'featured' && (styleClasses[link.style] || styleClasses.default),
                link.style === 'featured' && styleClasses.featured,
                isEditMode && 'cursor-pointer hover:border-dashed hover:border-white/60',
            )}
            style={{
                ...gradientStyle,
                ...featuredStyle,
                boxShadow: `0 4px 20px color-mix(in srgb, var(--primary) 10%, transparent)`,
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
                    boxShadow: `inset 0 0 30px color-mix(in srgb, var(--primary) 15%, transparent), 0 0 30px color-mix(in srgb, var(--primary) 10%, transparent)`,
                }}
            />

            {/* Content */}
            <div className="relative flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: 'var(--text-color)' }}>
                        {link.title}
                    </h3>
                    {link.description && (
                        <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
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
                        background: 'var(--primary)',
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
};

export const LinkBlock = memo(LinkBlockComponent, (prev, next) => {
    return (
        prev.link === next.link &&
        prev.index === next.index &&
        prev.isEditMode === next.isEditMode &&
        prev.theme.cardStyle === next.theme.cardStyle &&
        prev.theme.buttonStyle === next.theme.buttonStyle &&
        prev.theme.textColor === next.theme.textColor
        // Ignore primaryColor, backgroundType/Value
    );
});

interface LinksSectionProps {
    links: CustomLink[];
    theme: TreeProfileTheme;
    isEditMode?: boolean;
    onUpdate?: (links: CustomLink[]) => void;
}

function LinksSectionComponent({ links, theme, isEditMode, onUpdate }: LinksSectionProps) {
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
                {isEditMode && activeLinks.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={openForAdd}
                        className={cn(
                            "w-full py-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all group",
                            isLightTheme
                                ? "border-black/10 hover:border-black/20 hover:bg-black/5 text-black/60"
                                : "border-white/10 hover:border-white/20 hover:bg-white/5 text-white/60"
                        )}
                        style={{ color: 'var(--text-color)' }}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                            isLightTheme ? "bg-black/5 group-hover:bg-black/10" : "bg-white/10 group-hover:bg-white/20"
                        )}>
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium opacity-80">Add New Link</span>
                    </motion.button>
                )}
            </div>

            {/* Empty state for edit mode */}
            {isEditMode && activeLinks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 rounded-2xl border-2 border-dashed border-white/20 text-center"
                    style={{ borderColor: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}
                >
                    <p className="text-white/50 mb-3" style={{ color: 'var(--text-color)', opacity: 0.5 }}>No links added yet</p>
                    <button
                        onClick={openForAdd}
                        className="px-4 py-2 rounded-xl bg-white/10 font-medium hover:bg-white/20 transition-colors"
                        style={{ color: 'var(--text-color)', background: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}
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
                key={editingLink ? editingLink.id : 'new'}
                theme={theme}
            />
        </motion.div>
    );
}

export const LinksSection = memo(LinksSectionComponent, (prev, next) => {
    return (
        prev.links === next.links &&
        prev.isEditMode === next.isEditMode &&
        prev.theme.cardStyle === next.theme.cardStyle &&
        prev.theme.buttonStyle === next.theme.buttonStyle &&
        prev.theme.textColor === next.theme.textColor
    );
});
