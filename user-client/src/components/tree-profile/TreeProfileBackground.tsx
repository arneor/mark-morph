'use client';

import { memo } from 'react';
import Image from 'next/image';
import { TreeProfileTheme } from '@/lib/treeProfileTypes';

interface TreeProfileBackgroundProps {
    theme: TreeProfileTheme;
}

/**
 * TreeProfileBackground Component
 * 
 * Renders dynamic backgrounds for tree profiles with support for:
 * - Solid colors
 * - Gradients (static)
 * - Animated gradients
 * - Background images (Optimized with Next.js Image)
 * 
 * Following Next.js best practices with proper memoization
 */
function TreeProfileBackgroundComponent({ theme }: TreeProfileBackgroundProps) {
    /**
     * Get background style based on theme type
     * Properly handles all background types to prevent image caching issues
     */
    const getBackgroundStyle = () => {
        switch (theme.backgroundType) {
            case 'solid':
                return { backgroundColor: theme.backgroundColor };

            case 'gradient':
            case 'animated':
                // Both use gradient strings, never URL
                return { backgroundImage: theme.backgroundValue };

            // Image type handled separately via Next.js Image component for performance
            case 'image':
                return { backgroundColor: theme.backgroundColor || '#000' };

            default:
                return { backgroundColor: theme.backgroundColor };
        }
    };

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Base Background Layer - Key forces re-render when type changes */}
            <div
                key={`bg-${theme.backgroundType}-${theme.templateId}`}
                className="absolute inset-0 transition-colors duration-700 ease-in-out"
                style={getBackgroundStyle()}
            />

            {/* Background Image Optimization: Render Next.js Image for LCP/performance */}
            {theme.backgroundType === 'image' && theme.backgroundValue && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={theme.backgroundValue}
                        alt="Profile Background"
                        fill
                        priority
                        className="object-cover transition-opacity duration-700"
                        sizes="100vw"
                        quality={75}
                    />
                </div>
            )}

            {/* Animated Gradient Overlay - Only for animated gradients */}
            {theme.backgroundType === 'animated' && (
                <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay animate-gradient-slow"
                    style={{
                        backgroundImage: `linear-gradient(-45deg, ${theme.primaryColor}, #A855F7, #E639D0, #3CEAC8)`,
                        backgroundSize: '400% 400%',
                    }}
                />
            )}

            {/* Image Dark Overlay */}
            {theme.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/60 transition-opacity duration-700" />
            )}



            {/* Critical CSS for animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(50px, 30px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-40px, -40px); }
                }
                @keyframes gradient-move {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-float-slow {
                    animation: float 15s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 18s ease-in-out infinite;
                }
                .animate-gradient-slow {
                    animation: gradient-move 15s ease infinite;
                }
                .translate-z-0 {
                    transform: translateZ(0); /* Force hardware acceleration */
                }
            `}</style>
        </div>
    );
}

/**
 * Memoized export to prevent unnecessary re-renders
 * Only updates when theme object reference changes
 */
export const TreeProfileBackground = memo(TreeProfileBackgroundComponent);
