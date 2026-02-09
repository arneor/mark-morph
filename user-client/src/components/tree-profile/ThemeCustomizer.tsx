'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, Image as ImageIcon, Check, Sparkles, Wand2, Layers } from 'lucide-react';
import { TreeProfileTheme, TEMPLATES } from '@/lib/dummyTreeProfileData';
import { cn } from '@/lib/utils';

interface ThemeCustomizerProps {
    theme: TreeProfileTheme;
    onUpdate: (updates: Partial<TreeProfileTheme>) => void;
}

const TABS = [
    { id: 'templates', label: 'Templates', icon: Wand2 },
    { id: 'customize', label: 'Customize', icon: Palette },
];

const PRESET_COLORS = [
    '#9EE53B', // Lime
    '#3CEAC8', // Cyan
    '#A855F7', // Purple
    '#E639D0', // Pink
    '#FF6B35', // Orange
    '#FFD93D', // Yellow
    '#FF4D4D', // Red
    '#3B82F6', // Blue
    '#FFFFFF', // White
    '#000000', // Black
];

const FONTS = [
    { name: 'Modern', value: 'Outfit' },
    { name: 'Clean', value: 'Inter' },
    { name: 'Elegant', value: 'Playfair Display' },
    { name: 'Friendly', value: 'DM Sans' },
    { name: 'Tech', value: 'Space Grotesk' },
];

const BUTTON_STYLES = [
    { name: 'Rounded', value: 'rounded', class: 'rounded-xl' },
    { name: 'Pill', value: 'pill', class: 'rounded-full' },
    { name: 'Sharp', value: 'sharp', class: 'rounded-none' },
    { name: 'Soft', value: 'soft', class: 'rounded-xl' }, // New
    { name: 'Glass', value: 'glass', class: 'rounded-xl backdrop-blur-md' }, // New
];

const CARD_STYLES = [
    { name: 'Glass', value: 'glass', class: 'bg-white/5 backdrop-blur-lg border-white/10' },
    { name: 'Flat', value: 'flat', class: 'bg-white/10 border-transparent' },
    { name: 'Outline', value: 'outline', class: 'bg-transparent border-white/20' },
    { name: 'Minimal', value: 'minimal', class: 'bg-transparent border-transparent' },
];

export function ThemeCustomizer({ theme, onUpdate }: ThemeCustomizerProps) {
    const [activeTab, setActiveTab] = useState<'templates' | 'customize'>('templates');

    const handleApplyTemplate = (template: typeof TEMPLATES[keyof typeof TEMPLATES]) => {
        onUpdate({
            ...template,
            templateId: template.id,
        });
    };

    return (
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6 rounded-t-3xl shadow-2xl safe-area-bottom max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Theme Engine
                </h3>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'templates' | 'customize')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {activeTab === 'templates' ? (
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
                                        ? "border-primary"
                                        : "border-white/10 hover:border-white/30"
                                )}
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
                                    <div className="absolute top-3 right-3 z-20 bg-primary text-black p-1.5 rounded-full shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Background Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Background
                            </label>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                                {['solid', 'gradient', 'animated', 'image'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => onUpdate({ backgroundType: type as TreeProfileTheme['backgroundType'] })}
                                        className={cn(
                                            "py-2 rounded-lg text-xs font-medium capitalize transition-all",
                                            theme.backgroundType === type
                                                ? "bg-white/20 text-white shadow-lg"
                                                : "text-white/50 hover:text-white"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Detailed Input based on Background Type */}
                            <div className="pt-2">
                                {theme.backgroundType === 'solid' && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={theme.backgroundColor}
                                            onChange={(e) => onUpdate({ backgroundColor: e.target.value, backgroundValue: e.target.value })}
                                            className="w-12 h-12 rounded-full border-2 border-white/20 bg-transparent p-1 cursor-pointer"
                                        />
                                        <span className="text-white/60 text-sm">Solid Color</span>
                                    </div>
                                )}
                                {(theme.backgroundType === 'gradient' || theme.backgroundType === 'animated') && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Gradient Presets */}
                                        {[
                                            'linear-gradient(135deg, #0f172a 0%, #0a0a1a 50%, #1a0a2a 100%)',
                                            'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
                                            'linear-gradient(135deg, #be185d 0%, #881337 100%)',
                                            'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                                        ].map((grad, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onUpdate({ backgroundValue: grad })}
                                                className={cn(
                                                    "h-10 rounded-lg border-2 transition-all",
                                                    theme.backgroundValue === grad ? "border-white" : "border-transparent"
                                                )}
                                                style={{ background: grad }}
                                            />
                                        ))}
                                    </div>
                                )}
                                {theme.backgroundType === 'image' && (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={theme.backgroundValue.startsWith('http') ? theme.backgroundValue : ''}
                                            onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                                            placeholder="Paste Image URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                        />
                                        <button className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-colors text-white/60 text-sm flex flex-col items-center gap-2">
                                            <ImageIcon className="w-6 h-6" />
                                            Upload Image (Pro)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colors Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                <Palette className="w-3 h-3" /> Color Palette
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => onUpdate({ primaryColor: color })}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 transition-all duration-200 relative",
                                            theme.primaryColor === color
                                                ? "border-white scale-110 shadow-lg shadow-white/20"
                                                : "border-transparent hover:scale-105"
                                        )}
                                        style={{ background: color }}
                                    >
                                        {theme.primaryColor === color && (
                                            <Check className="w-5 h-5 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )}
                                    </button>
                                ))}
                                <div className="w-10 h-10 rounded-full border border-white/20 bg-linear-to-br from-white/10 to-transparent flex items-center justify-center relative overflow-hidden group">
                                    <input
                                        type="color"
                                        value={theme.primaryColor}
                                        onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-[150%] h-[150%] -top-2 -left-2"
                                    />
                                    <div className="w-full h-full bg-[conic-gradient(from_180deg_at_50%_50%,#FF0000_0deg,#00FF00_120deg,#0000FF_240deg,#FF0000_360deg)] opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                <Type className="w-3 h-3" /> Typography
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {FONTS.map((font) => (
                                    <button
                                        key={font.value}
                                        onClick={() => onUpdate({ fontFamily: font.value })}
                                        className={cn(
                                            "px-4 py-3 rounded-xl border text-sm text-left transition-all relative overflow-hidden",
                                            theme.fontFamily === font.value
                                                ? "bg-white/10 border-white/40 text-white"
                                                : "bg-transparent border-white/10 text-white/60 hover:bg-white/5"
                                        )}
                                        style={{ fontFamily: font.value }}
                                    >
                                        <span className="relative z-10">{font.name}</span>
                                        {theme.fontFamily === font.value && (
                                            <motion.div
                                                layoutId="activeFont"
                                                className="absolute inset-0 bg-white/5"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Styles Row */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Button Style */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <Layout className="w-3 h-3" /> Buttons
                                </label>
                                <div className="space-y-2">
                                    {BUTTON_STYLES.map((style) => (
                                        <button
                                            key={style.value}
                                            onClick={() => onUpdate({ buttonStyle: style.value as TreeProfileTheme['buttonStyle'] })}
                                            className={cn(
                                                "w-full py-2 border text-xs font-medium transition-all relative block",
                                                style.class,
                                                theme.buttonStyle === style.value
                                                    ? "bg-white text-black border-white"
                                                    : "bg-transparent border-white/20 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Card Style */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> Cards
                                </label>
                                <div className="space-y-2">
                                    {CARD_STYLES.map((style) => (
                                        <button
                                            key={style.value}
                                            onClick={() => onUpdate({ cardStyle: style.value as TreeProfileTheme['cardStyle'] })}
                                            className={cn(
                                                "w-full py-2 px-3 border text-xs font-medium transition-all relative block rounded-lg text-left",
                                                theme.cardStyle === style.value
                                                    ? "border-primary text-white bg-primary/10"
                                                    : "border-white/10 text-white/60 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{style.name}</span>
                                                {theme.cardStyle === style.value && <Check className="w-3 h-3" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
