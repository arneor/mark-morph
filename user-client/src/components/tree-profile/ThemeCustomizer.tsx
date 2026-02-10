'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { TEMPLATES } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';
import { useTreeProfileStore } from '@/stores/useTreeProfileStore';

/**
 * ThemeCustomizer Component
 * 
 * Provides template selection for the Tree Profile theme.
 * Following Next.js best practices:
 * - Memoized for performance
 * - Uses Zustand for global state management
 * - Proper TypeScript typing
 * - Semantic HTML and accessibility
 */
function ThemeCustomizerComponent() {
    const { profileData, updateTheme, setIsThemeOpen } = useTreeProfileStore();
    const theme = profileData.theme;

    /**
     * Handle template application
     * Ensures all template properties are applied, fixing the background image persistence bug
     */
    const handleApplyTemplate = useCallback((template: typeof TEMPLATES[keyof typeof TEMPLATES]) => {
        // Apply the complete template to avoid property persistence from previous selections
        updateTheme({
            primaryColor: template.primaryColor,
            backgroundColor: template.backgroundColor,
            backgroundType: template.backgroundType,
            backgroundValue: template.backgroundValue,
            textColor: template.textColor,
            fontFamily: template.fontFamily,
            buttonStyle: template.buttonStyle,
            cardStyle: template.cardStyle,
            templateId: template.id,
        });
    }, [updateTheme]);

    const handleClose = useCallback(() => {
        setIsThemeOpen(false);
    }, [setIsThemeOpen]);

    return (
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6 rounded-t-3xl shadow-2xl safe-area-bottom max-h-[85vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Theme Templates
                </h3>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5"
                    aria-label="Close theme customizer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-2 gap-4">
                {Object.values(TEMPLATES).map((template) => (
                    <motion.button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative aspect-4/3 rounded-2xl overflow-hidden border-2 text-left p-4 flex flex-col justify-end transition-all group",
                            theme.templateId === template.id
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-white/10 hover:border-white/30"
                        )}
                        aria-pressed={theme.templateId === template.id}
                        aria-label={`Select ${template.name} template`}
                    >
                        {/* Preview Background */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: template.backgroundType === 'image'
                                    ? `url(${template.backgroundValue}) center/cover`
                                    : template.backgroundValue
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 z-10" />

                        {/* Content */}
                        <div className="relative z-20">
                            <div
                                className="text-white font-bold text-lg mb-1"
                                style={{ fontFamily: template.fontFamily }}
                            >
                                {template.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                    {template.type}
                                </span>
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {theme.templateId === template.id && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 z-20 bg-primary text-black p-1.5 rounded-full shadow-lg"
                            >
                                <Check className="w-4 h-4" />
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Info Text */}
            <p className="text-white/40 text-xs text-center mt-6">
                Select a template to instantly apply a professional theme to your profile
            </p>
        </div>
    );
}

/**
 * Memoized export following Next.js performance best practices
 * Only re-renders when store values actually change
 */
export const ThemeCustomizer = memo(ThemeCustomizerComponent);
