'use client';

import { useState, useRef, useSyncExternalStore, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Share2, MessageCircle, Star, Sparkles, Flame, Leaf, Check } from 'lucide-react';
import { CatalogItem, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';

const emptySubscribe = () => () => { };
const useIsMounted = () => {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
};

interface CatalogItemPopupProps {
    isOpen: boolean;
    onClose: () => void;
    item: CatalogItem | null;
    theme: TreeProfileTheme;
    businessName?: string;
    whatsappNumber?: string;
    whatsappEnquiryEnabled?: boolean;
    username?: string;
}

export function CatalogItemPopup({ isOpen, onClose, item, theme, businessName, whatsappNumber, username }: CatalogItemPopupProps) {
    const mounted = useIsMounted();
    const [isCopied, setIsCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleShare = async () => {
        if (!item) return;

        const url = window.location.href;
        const shareData = {
            title: item.title,
            text: `Check out ${item.title} at ${businessName || 'LinkBeet'}!`,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
                copyToClipboard(url);
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleWhatsAppEnquiry = () => {
        if (!item || !whatsappNumber) return;
        const profileUrl = username ? `${window.location.origin}/${username}?item=${item.id}` : window.location.href;
        const priceText = item.price != null && item.price > 0 ? ` (${item.currency || '₹'}${item.price})` : '';
        const message = `Hi! I'm interested in *${item.title}*${priceText} from ${businessName || 'your store'}.\n🔗 ${profileUrl}\n\nCould you share more details?`;
        const url = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (!mounted || !isOpen || !item) return null;

    const isLightTheme = isColorExclusivelyDark(theme.textColor);

    const tagIcons: Record<string, React.ReactNode> = {
        bestseller: <Star className="w-3 h-3" />,
        new: <Sparkles className="w-3 h-3" />,
        featured: <Flame className="w-3 h-3" />,
        veg: <Leaf className="w-3 h-3 text-green-400" />,
        spicy: <Flame className="w-3 h-3 text-red-500" />,
    };

    const tagColors: Record<string, string> = {
        bestseller: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        new: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        featured: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        veg: 'bg-green-500/20 text-green-300 border-green-500/30',
        'non-veg': 'bg-red-500/20 text-red-300 border-red-500/30',
        spicy: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    // Calculate contrast-safe background for the modal
    // Calculate contrast-safe background for the modal
    const modalBg = isLightTheme
        ? 'bg-white/95 border-black/10 text-black'
        : 'bg-[#1a1a1a]/95 border-white/10 text-white';

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border backdrop-blur-3xl animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-hide flex flex-col",
                    modalBg
                )}
                style={{ fontFamily: theme.fontFamily }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        "absolute top-4 right-4 z-20 p-2 rounded-full transition-colors",
                        isLightTheme ? "bg-black/10 hover:bg-black/20 text-black" : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className="relative w-full aspect-square shrink-0 bg-black/5">
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold opacity-20" style={{ backgroundColor: theme.primaryColor }}>
                            {item.title.charAt(0)}
                        </div>
                    )}

                    {/* Tags Overlay */}
                    {item.tags && item.tags.length > 0 && (
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                                <span
                                    key={tag}
                                    className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md shadow-sm",
                                        tagColors[tag] || "bg-white/20 border-white/20 text-white"
                                    )}
                                >
                                    {tagIcons[tag]}
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 flex flex-col gap-4 grow">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h2 className="text-2xl font-bold leading-tight mb-1">{item.title}</h2>
                            {/* Price */}
                            {item.price !== undefined && item.price > 0 && (
                                <p className="text-xl font-bold" style={{ color: theme.primaryColor }}>
                                    {item.currency}{item.price}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* WhatsApp Enquiry Button */}
                            {(item?.whatsappEnquiryEnabled !== false) && whatsappNumber && (
                                <button
                                    onClick={handleWhatsAppEnquiry}
                                    className="p-2.5 rounded-full shrink-0 transition-all active:scale-95 flex items-center justify-center bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg shadow-[#25D366]/20"
                                    title="Enquire on WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            )}

                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                className={cn(
                                    "p-2.5 rounded-full shrink-0 transition-all active:scale-95 flex items-center justify-center gap-2",
                                    isLightTheme
                                        ? "bg-black/5 hover:bg-black/10 text-black"
                                        : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                                title="Share Item"
                            >
                                {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {item.description && (
                        <p className={cn(
                            "text-sm leading-relaxed",
                            isLightTheme ? "text-black/70" : "text-white/70"
                        )}>
                            {item.description}
                        </p>
                    )}

                    {!item.isAvailable && (
                        <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center">
                            Currently Unavailable
                        </div>
                    )}

                    {/* Footer Actions (if needed in future, e.g. Add to Cart) 
                        For now, purely informational/sharing.
                    */}
                </div>
            </div>

            {isCopied && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up z-60">
                    Link copied to clipboard!
                </div>
            )}
        </div>,
        document.body
    );
}
