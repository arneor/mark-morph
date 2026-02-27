'use client';

import { memo, useCallback } from 'react';

import { Check, Sparkles, X, MessageCircle } from 'lucide-react';
import { TEMPLATES } from '@/lib/treeProfileTypes';
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
    const { profileData, updateTheme, setIsThemeOpen, updateWhatsApp } = useTreeProfileStore();
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
                    <button
                        key={template.id}
                        onClick={() => handleApplyTemplate(template)}

                        className={cn(
                            "relative aspect-4/3 rounded-2xl overflow-hidden border-2 text-left p-4 flex flex-col justify-end transition-all group cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
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
                            <div
                                className="absolute top-3 right-3 z-20 bg-primary text-black p-1.5 rounded-full shadow-lg animate-fade-in"
                            >
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Info Text */}
            <p className="text-white/40 text-xs text-center mt-6">
                Select a template to instantly apply a professional theme to your profile
            </p>

            {/* ─── WhatsApp Enquiry Settings ─── */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    WhatsApp Enquiry
                </h4>

                {/* Toggle */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-white/80 text-sm">Enable for products</p>
                        <p className="text-white/40 text-xs">Show WhatsApp button on product popups</p>
                    </div>
                    <button
                        onClick={() => {
                            const newEnabled = !profileData.whatsappEnquiryEnabled;
                            updateWhatsApp(profileData.whatsappNumber, newEnabled);
                        }}
                        className={cn(
                            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                            profileData.whatsappEnquiryEnabled
                                ? "bg-[#25D366]"
                                : "bg-white/20"
                        )}
                        role="switch"
                        aria-checked={!!profileData.whatsappEnquiryEnabled}
                    >
                        <span
                            className={cn(
                                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200",
                                profileData.whatsappEnquiryEnabled && "translate-x-5"
                            )}
                        />
                    </button>
                </div>

                {/* Phone Number Input */}
                {profileData.whatsappEnquiryEnabled && (
                    <div className="mt-3">
                        <label className="text-white/60 text-xs font-medium mb-1.5 block">
                            WhatsApp Number (with country code)
                        </label>
                        <input
                            type="tel"
                            placeholder="e.g. 919876543210"
                            value={profileData.whatsappNumber || ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^\d+]/g, '');
                                updateWhatsApp(val, true);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#25D366]/50 focus:ring-1 focus:ring-[#25D366]/30 transition-colors"
                        />
                        {profileData.whatsappNumber && (
                            <p className="text-white/30 text-xs mt-1.5">
                                Customers will message: wa.me/{profileData.whatsappNumber.replace(/[^\d]/g, '')}
                            </p>
                        )}
                        {profileData.whatsappEnquiryEnabled && !profileData.whatsappNumber && (
                            <p className="text-amber-400/80 text-xs mt-1.5">
                                ⚠️ Enter a number to activate the WhatsApp button
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Memoized export following Next.js performance best practices
 * Only re-renders when store values actually change
 */
export const ThemeCustomizer = memo(ThemeCustomizerComponent);
