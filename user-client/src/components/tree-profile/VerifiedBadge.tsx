'use client';

import { useState } from 'react';

interface VerifiedBadgeProps {
    size?: number;
    primaryColor?: string;
    className?: string;
}

/**
 * A clean, minimal verified badge — solid filled circle with a white checkmark.
 * Professional design inspired by Instagram / X verified badges.
 * Pure CSS implementation — no framer-motion.
 */
export function VerifiedBadge({ size = 22, primaryColor = '#1DA1F2', className }: VerifiedBadgeProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className={`relative inline-flex items-center justify-center shrink-0 ${className || ''}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-fade-in"
            >
                {/* Solid filled circle */}
                <circle cx="12" cy="12" r="11" fill={primaryColor} />

                {/* White checkmark */}
                <path
                    d="M7.5 12.5L10.5 15.5L16.5 9"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap animate-fade-in"
                >
                    <div className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/80 text-white shadow-lg">
                        Verified
                    </div>
                </div>
            )}
        </div>
    );
}
