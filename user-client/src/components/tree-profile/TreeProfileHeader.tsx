'use client';

import { useState, useRef, memo } from 'react';
import Image from 'next/image';
import {
    MapPin,
    BadgeCheck,
    Instagram,
    Facebook,
    Phone,
    Mail,
    Youtube,
    Twitter,
    Camera,
    X,
    Plus,
    Link as LinkIcon,
    Clock,
} from 'lucide-react';
import { TreeProfileData, SocialLink } from '@/lib/treeProfileTypes';
import { cn, isColorExclusivelyDark } from '@/lib/utils';
import { SocialLinkModal } from './SocialLinkModal';

// WhatsApp and TikTok custom icons
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

import { businessApi } from '@/lib/api';

interface TreeProfileHeaderProps {
    businessId: string;
    data: TreeProfileData;
    isEditMode?: boolean;
    onUpdate?: (updates: Partial<TreeProfileData>) => void;
}

const socialIconMap: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    whatsapp: <WhatsAppIcon />,
    twitter: <Twitter className="w-5 h-5" />,
    tiktok: <TikTokIcon />,
    youtube: <Youtube className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
    phone: <Phone className="w-5 h-5" />,
    linkedin: <LinkIcon className="w-5 h-5" />,
};

function TreeProfileHeaderComponent({ businessId, data, isEditMode, onUpdate }: TreeProfileHeaderProps) {
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    // Social Modal State
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

    // Check if theme is likely light mode based on text color brightness
    const isLightTheme = isColorExclusivelyDark(data.theme.textColor);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpdate) {
            try {
                // Upload to S3
                const { url } = await businessApi.uploadMedia(businessId, file, 'tree-profile-banners'); // Re-using existing placement or 'tree-profile-header'
                onUpdate({ bannerImage: url });
            } catch (error) {
                console.error("Failed to upload banner:", error);
                alert("Failed to upload banner. Please try again.");
            }
        }
    };

    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpdate) {
            try {
                // Upload to S3
                const { url } = await businessApi.uploadMedia(businessId, file, 'tree-profile-profile');
                onUpdate({ profileImage: url });
            } catch (error) {
                console.error("Failed to upload profile image:", error);
                alert("Failed to upload profile image. Please try again.");
            }
        }
    };

    const handleSaveSocialLink = (linkData: { platform: string; url: string; label?: string }) => {
        if (!onUpdate) return;

        let newLinks = [...data.socialLinks];

        if (editingLink) {
            // Update existing
            newLinks = newLinks.map(link =>
                link.id === editingLink.id
                    ? { ...link, ...linkData, platform: linkData.platform as SocialLink['platform'] }
                    : link
            );
        } else {
            // Add new
            const newLink: SocialLink = {
                id: `social-${Date.now()}`,
                platform: linkData.platform as SocialLink['platform'],
                url: linkData.url,
                label: linkData.label
            };
            newLinks.push(newLink);
        }

        onUpdate({ socialLinks: newLinks });
        setEditingLink(null);
    };

    const handleDeleteSocialLink = () => {
        if (!onUpdate || !editingLink) return;
        const newLinks = data.socialLinks.filter(link => link.id !== editingLink.id);
        onUpdate({ socialLinks: newLinks });
        setEditingLink(null);
    };

    const openSocialModal = (link?: SocialLink) => {
        setEditingLink(link || null);
        setIsSocialModalOpen(true);
    };

    return (
        <div className="relative w-full mb-8 animate-fade-in">
            {/* Banner Image */}
            <div className="relative w-full h-56 md:h-72 rounded-b-[2.5rem] overflow-hidden shadow-2xl -mt-20 sm:-mt-24 mx-auto max-w-4xl group">
                {data.bannerImage ? (
                    <Image
                        src={data.bannerImage}
                        alt="Banner"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 896px"
                        className="object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full opacity-30"
                        style={{
                            background: `linear-gradient(to bottom, var(--primary), #000)`,
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />

                {/* Banner Edit Controls */}
                {isEditMode && (
                    <div className="absolute inset-0 z-20 m-2 rounded-b-4xl rounded-t-lg border-2 border-dashed border-white/50 bg-black/20 hover:bg-black/40 hover:border-white transition-all duration-300 group/edit">
                        <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                            <div className="bg-black/50 p-4 rounded-full backdrop-blur-md group-hover/edit:scale-110 transition-transform shadow-xl">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <span className="font-bold text-white text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                                Tap to Change Cover
                            </span>
                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBannerUpload}
                            />
                        </label>

                        {/* Remove Button (Top Right of the overlay) */}
                        {data.bannerImage && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm('Remove cover image?')) {
                                        onUpdate?.({ bannerImage: undefined });
                                    }
                                }}
                                className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 z-30"
                                title="Remove Cover"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Container - Overlapping Banner */}
            <div className="relative px-6 -mt-16 text-center z-10">
                {/* Avatar with Animated Ring */}
                <div className="relative w-36 h-36 mx-auto mb-6 group">
                    <div
                        className="absolute inset-[-4px] rounded-full bg-linear-to-br from-primary via-[#A855F7] to-primary"
                    />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#0f1016] shadow-sm bg-black">
                        {data.profileImage ? (
                            <Image
                                src={data.profileImage}
                                alt={data.businessName}
                                fill
                                priority
                                sizes="144px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/60">
                                {data.businessName.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Profile Edit Overlay */}
                    {isEditMode && (
                        <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white/90" />
                            <input
                                ref={profileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileUpload}
                            />
                        </label>
                    )}
                </div>

                {/* Business Name */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    {isEditMode ? (
                        <input
                            type="text"
                            value={data.businessName}
                            onChange={(e) => onUpdate?.({ businessName: e.target.value })}
                            className="text-3xl font-display font-extrabold text-center bg-transparent border-b outline-none w-full max-w-xs transition-colors"
                            style={{
                                color: 'var(--text-color)',
                                borderColor: 'color-mix(in srgb, var(--text-color) 30%, transparent)',
                            }}
                            placeholder="Business Name"
                        />
                    ) : (
                        <h1
                            className="text-3xl font-display font-extrabold tracking-tight"
                            style={{ color: 'var(--text-color)' }}
                        >
                            {data.businessName}
                        </h1>
                    )}
                    {data.isVerified && (
                        <BadgeCheck
                            className="w-6 h-6 shrink-0"
                            style={{ color: 'var(--primary)' }}
                        />
                    )}
                </div>

                {/* Tagline */}
                <div className="mb-3">
                    {isEditMode ? (
                        <input
                            type="text"
                            value={data.tagline}
                            onChange={(e) => onUpdate?.({ tagline: e.target.value })}
                            className="text-lg font-medium text-center bg-transparent border-b outline-none w-full max-w-sm transition-colors py-1"
                            style={{
                                color: 'var(--text-color)',
                                opacity: 0.8,
                                borderColor: 'color-mix(in srgb, var(--text-color) 30%, transparent)'
                            }}
                            placeholder="Add a tagline..."
                        />
                    ) : (
                        <p
                            className="text-lg font-medium"
                            style={{ color: 'var(--text-color)', opacity: 0.8 }}
                        >
                            {data.tagline}
                        </p>
                    )}
                </div>

                {/* Location */}
                <div
                    className="flex items-center justify-center gap-1.5 mb-6"
                    style={{ color: 'var(--text-color)', opacity: 0.6 }}
                >
                    <MapPin className="w-4 h-4 shrink-0" />
                    {isEditMode ? (
                        <input
                            type="text"
                            value={data.location || ''}
                            onChange={(e) => onUpdate?.({ location: e.target.value })}
                            className="text-sm bg-transparent border-b outline-none min-w-[150px] text-center transition-colors"
                            style={{
                                color: 'inherit',
                                borderColor: 'color-mix(in srgb, var(--text-color) 30%, transparent)'
                            }}
                            placeholder="Add location"
                        />
                    ) : (
                        <span className="text-sm">{data.location}</span>
                    )}
                </div>

                {/* Opening Hours */}
                <div
                    className="flex items-center justify-center gap-1.5 mb-6"
                    style={{ color: 'var(--text-color)', opacity: 0.7 }}
                >
                    <Clock className="w-4 h-4 shrink-0" />
                    {isEditMode ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={data.openingHours?.start || ''}
                                onChange={(e) => onUpdate?.({
                                    openingHours: {
                                        start: e.target.value,
                                        end: data.openingHours?.end || ''
                                    }
                                })}
                                className="text-sm bg-transparent border-b outline-none w-20 text-center transition-colors"
                                style={{
                                    color: 'inherit',
                                    borderColor: 'color-mix(in srgb, var(--text-color) 30%, transparent)'
                                }}
                                placeholder="Start Time"
                            />
                            <span>-</span>
                            <input
                                type="text"
                                value={data.openingHours?.end || ''}
                                onChange={(e) => onUpdate?.({
                                    openingHours: {
                                        start: data.openingHours?.start || '',
                                        end: e.target.value
                                    }
                                })}
                                className="text-sm bg-transparent border-b outline-none w-20 text-center transition-colors"
                                style={{
                                    color: 'inherit',
                                    borderColor: 'color-mix(in srgb, var(--text-color) 30%, transparent)'
                                }}
                                placeholder="End Time"
                            />
                        </div>
                    ) : (data.openingHours?.start && data.openingHours?.end) && (
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                            <span className="text-green-500 font-bold uppercase text-[10px] tracking-wider border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 rounded-full">Open</span>
                            <span>{data.openingHours.start} - {data.openingHours.end}</span>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                <div
                    className="flex justify-center gap-3 flex-wrap"
                >
                    {data.socialLinks.map((social) => (
                        <a
                            key={social.id}
                            href={isEditMode ? undefined : (social.url.match(/^https?:\/\//) ? social.url : `https://${social.url}`)}
                            target={isEditMode ? undefined : "_blank"}
                            rel={isEditMode ? undefined : "noopener noreferrer"}
                            onClick={(e) => {
                                if (isEditMode) {
                                    e.preventDefault();
                                    openSocialModal(social);
                                }
                            }}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer border hover:scale-110 hover:-translate-y-0.5 active:scale-95 duration-200",
                                isLightTheme
                                    ? "bg-black/5 border-black/10 text-black/70 hover:bg-black/10 hover:text-black" // Light Theme
                                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white" // Dark Theme
                            )}
                            style={{
                                boxShadow: `0 0 15px color-mix(in srgb, var(--primary) 15%, transparent)`,
                            }}
                        >
                            {socialIconMap[social.platform] || <Mail className="w-4 h-4" />}
                            {isEditMode && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                </div>
                            )}
                        </a>
                    ))}

                    {/* Add Button */}
                    {isEditMode && (
                        <button
                            className={cn(
                                "w-10 h-10 rounded-full border border-dashed flex items-center justify-center transition-all hover:scale-110 active:scale-90 duration-200",
                                isLightTheme
                                    ? "bg-black/5 border-black/20 text-black/50 hover:text-black hover:bg-black/10"
                                    : "bg-white/5 border-white/30 text-white/50 hover:text-white hover:bg-white/10"
                            )}
                            onClick={() => openSocialModal()}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Social Link Modal */}
            <SocialLinkModal
                isOpen={isSocialModalOpen}
                onClose={() => {
                    setIsSocialModalOpen(false);
                }}
                onSave={handleSaveSocialLink}
                onDelete={handleDeleteSocialLink}
                initialData={editingLink}
                key={editingLink ? editingLink.id : 'new'}
            />
        </div>
    );
}

export const TreeProfileHeader = memo(TreeProfileHeaderComponent, (prev, next) => {
    // Return true if props are equivalent (should NOT re-render)
    if (prev.isEditMode !== next.isEditMode) return false;

    // Check Content
    if (prev.data.businessName !== next.data.businessName) return false;
    if (prev.data.tagline !== next.data.tagline) return false;
    if (prev.data.location !== next.data.location) return false;
    if (prev.data.profileImage !== next.data.profileImage) return false;
    if (prev.data.bannerImage !== next.data.bannerImage) return false;
    if (prev.data.isVerified !== next.data.isVerified) return false;
    if (prev.data.socialLinks !== next.data.socialLinks) return false;

    // Fixed: check for opening hours changes
    if (prev.data.openingHours?.start !== next.data.openingHours?.start) return false;
    if (prev.data.openingHours?.end !== next.data.openingHours?.end) return false;

    // Check Logic-Affecting Theme Props
    if (prev.data.theme.textColor !== next.data.theme.textColor) return false;
    if (prev.data.theme.fontFamily !== next.data.theme.fontFamily) return false;

    return true;
});
