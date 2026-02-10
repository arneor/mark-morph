
'use client';

import { memo } from 'react';
import { TreeProfileTheme } from '@/lib/dummyTreeProfileData';
import { motion } from 'framer-motion';

interface TreeProfileBackgroundProps {
    theme: TreeProfileTheme;
}

function TreeProfileBackgroundComponent({ theme }: TreeProfileBackgroundProps) {
    // Memoized background styles to prevent re-calculations
    const bgStyle = {
        background: theme.backgroundType === 'solid'
            ? theme.backgroundColor
            : theme.backgroundType === 'gradient'
                ? theme.backgroundValue
                : `url(${theme.backgroundValue}) center/cover no-repeat`,
    };

    return (
        <div className="fixed inset-0 z-0 pointer-events-none transform-gpu translate-z-0">
            {/* Base Background Layer */}
            <div
                className="absolute inset-0 transition-all duration-700 ease-in-out will-change-[background]"
                style={bgStyle}
            />

            {/* Animated Gradient Overlay - Only for gradient type */}
            {theme.backgroundType === 'gradient' && (
                <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay animate-gradient-slow"
                    style={{
                        background: `linear-gradient(-45deg, ${theme.primaryColor}, #A855F7, #E639D0, #3CEAC8)`,
                        backgroundSize: '400% 400%',
                    }}
                />
            )}

            {/* Image Dark Overlay */}
            {theme.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/60 transition-opacity duration-700" />
            )}

            {/* Noise Texture - Static, strict opacity */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Optimized Floating Orbs - Only rendered if meaningful for the theme */}
            {/* Using CSS animation via class or simplified motion for performance */}
            <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blend-screen animate-float-slow"
                style={{ background: theme.primaryColor }}
            />

            <div className="absolute bottom-40 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 bg-blend-screen animate-float-delayed"
                style={{ background: '#A855F7' }}
            />

            {/* Add critical CSS for animations to avoid JS thread blocking */}
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

// Memoize to prevent re-renders when parent state changes but theme doesn't
export const TreeProfileBackground = memo(TreeProfileBackgroundComponent);
