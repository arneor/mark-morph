'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface VerifiedBadgeProps {
    size?: number;
    primaryColor?: string;
    className?: string;
}

/**
 * A clean, minimal verified badge — solid filled circle with a white checkmark.
 * Professional design inspired by Instagram / X verified badges.
 */
export function VerifiedBadge({ size = 22, primaryColor = '#1DA1F2', className }: VerifiedBadgeProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className={`relative inline-flex items-center justify-center shrink-0 ${className || ''}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
            >
                {/* Solid filled circle */}
                <circle cx="12" cy="12" r="11" fill={primaryColor} />

                {/* White checkmark */}
                <motion.path
                    d="M7.5 12.5L10.5 15.5L16.5 9"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, delay: 0.4, ease: 'easeOut' }}
                />
            </motion.svg>

            {/* Tooltip */}
            {showTooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                >
                    <div className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/80 text-white shadow-lg">
                        Verified
                    </div>
                </motion.div>
            )}
        </div>
    );
}
