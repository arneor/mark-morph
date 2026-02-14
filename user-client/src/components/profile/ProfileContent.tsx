'use client';


import { Wifi, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Business } from '@/lib/api';

// Since we haven't refactored the legacy components to be purely "display" vs "edit",
// we will implement a clean read-only view here using standard UI elements
// instead of trying to coerce the complex "Editable" components into read-only mode for now.
// This ensures the public profile is fast and lightweight.

interface ProfileContentProps {
    business: Business;
}

export function ProfileContent({ business }: ProfileContentProps) {
    const posts = (business.ads || []).map((ad, idx: number) => ({
        id: ad.id || `ad-${idx}`,
        title: ad.title,
        url: ad.mediaUrl,
        type: ad.mediaType || 'image',
        isFeatured: ad.placement === 'BANNER',
    }));

    const featuredPosts = posts.filter(p => p.isFeatured);
    const galleryPosts = posts.filter(p => !p.isFeatured);

    return (
        <div className="min-h-screen flex justify-center relative overflow-hidden bg-slate-900">
            {/* Vibrant animated gradient background */}
            <div className="absolute inset-0 animated-gradient opacity-95" />

            {/* Floating decorative blobs */}
            <div
                className="absolute top-10 -left-20 w-64 h-64 blob opacity-30 animate-float"
                style={{ background: 'linear-gradient(135deg, #9EE53B, #43E660)' }}
            />
            <div
                className="absolute bottom-40 -right-10 w-80 h-80 blob opacity-25 animate-float-delayed"
                style={{ background: 'linear-gradient(135deg, #A855F7, #E639D0)' }}
            />
            <div
                className="absolute top-1/3 right-0 w-48 h-48 blob opacity-20 animate-float-delayed-2"
                style={{ background: 'linear-gradient(135deg, #28C5F5, #3CEAC8)' }}
            />

            {/* Mobile container */}
            <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pt-8 pb-8" style={{ scrollBehavior: 'smooth' }}>

                    {/* Header */}
                    <div
                        className="px-6 text-center space-y-4 animate-fade-in"
                    >
                        {/* Logo */}
                        <div className="relative w-28 h-28 mx-auto">
                            <div className="absolute inset-0 rounded-full gradient-lime-cyan opacity-30 blur-xl animate-pulse" />
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                {business.logoUrl ? (
                                    <Image
                                        src={business.logoUrl}
                                        alt={business.businessName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <Wifi className="w-12 h-12 text-white" />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <h1 className="text-3xl font-display font-extrabold text-white mb-2">
                                {business.businessName}
                            </h1>
                            {business.location && (
                                <div className="flex items-center justify-center gap-1.5 text-white/70">
                                    <MapPin className="w-4 h-4" />
                                    <span>{business.location}</span>
                                </div>
                            )}
                            {business.description && (
                                <p className="text-white/80 mt-3 text-sm leading-relaxed max-w-xs mx-auto">
                                    {business.description}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            {business.googleReviewUrl && (
                                <a
                                    href={business.googleReviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    Rate Us
                                </a>
                            )}
                            {business.websiteUrl && (
                                <a
                                    href={business.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-2.5 rounded-full bg-white/10 text-white border border-white/20 font-bold text-sm hover:bg-white/20 transition-colors"
                                >
                                    Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="px-4 mt-8 space-y-6">

                        {/* Featured Section */}
                        {featuredPosts.length > 0 && (
                            <div
                                className="space-y-3 animate-fade-in"
                            >
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Featured</h3>
                                <div className="grid gap-4">
                                    {featuredPosts.map((post) => (
                                        <a
                                            key={post.id}
                                            href={post.url} // Or handle expand
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-lg group"
                                        >
                                            <Image
                                                src={post.url}
                                                alt={post.title || 'Featured'}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                                                <p className="text-white font-bold">{post.title}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery Section */}
                        {galleryPosts.length > 0 && (
                            <div
                                className="space-y-3 animate-fade-in"
                            >
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Gallery</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {galleryPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5"
                                        >
                                            <Image
                                                src={post.url}
                                                alt={post.title || 'Gallery Image'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact / Links */}
                        <div className="pt-8 text-center pb-8">
                            <p className="text-white/30 text-xs">Based in {business.location}</p>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <span className="text-[11px] text-white/40 font-medium">
                                Powered by{" "}
                                <span className="text-[#9EE53B]/70">MarkMorph</span>
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
