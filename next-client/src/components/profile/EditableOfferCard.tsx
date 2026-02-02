
import { motion } from "framer-motion";
import { Zap, Sparkles, Eye, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface SplashCustomization {
    welcomeTitle?: string;
    description?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    showWelcomeBanner?: boolean;
}

interface EditableOfferCardProps {
    data: SplashCustomization;
    businessName: string;
    onUpdate: (updates: Partial<SplashCustomization>) => void;
    isEditMode: boolean;
}

export function EditableOfferCard({ data, businessName, onUpdate, isEditMode }: EditableOfferCardProps) {
    const isActive = data.showWelcomeBanner !== false; // Default true
    const welcomeTitle = data.welcomeTitle || "Connect & Enjoy Free WiFi!";
    const description = data.description || `Explore exclusive offers from ${businessName}`;
    const ctaText = data.ctaButtonText || "View Offers";

    // If not active and not in edit mode, don't render
    if (!isActive && !isEditMode) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FFD93D]" />
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                        Splash Screen Preview
                    </span>
                </div>
                {isEditMode && (
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Label htmlFor="banner-active" className="text-xs font-medium text-white cursor-pointer">
                            {isActive ? "Active" : "Hidden"}
                        </Label>
                        <Switch
                            id="banner-active"
                            checked={isActive}
                            onCheckedChange={(checked) => onUpdate({ showWelcomeBanner: checked })}
                            className="scale-75"
                        />
                    </div>
                )}
            </div>

            <motion.div
                layout
                className={`relative overflow-hidden rounded-2xl gradient-purple-pink p-5 group transition-all duration-300 ${!isActive && isEditMode ? 'opacity-50 grayscale' : ''}`}
            >
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                    <Sparkles className="w-20 h-20 text-white" />
                </div>

                <div className="relative z-10 space-y-3">
                    {/* Welcome Label */}
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD93D]" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                            Welcome to {businessName}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {/* Welcome Title */}
                        {isEditMode ? (
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider text-white/60 font-bold ml-1">Welcome Title</label>
                                <Input
                                    value={data.welcomeTitle || ""}
                                    onChange={(e) => onUpdate({ welcomeTitle: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-display font-bold text-lg h-auto py-2 focus-visible:ring-1 focus-visible:ring-white/50"
                                    placeholder="Connect & Enjoy Free WiFi!"
                                />
                            </div>
                        ) : (
                            <h3 className="text-xl font-display font-bold text-white leading-tight">
                                {welcomeTitle}
                            </h3>
                        )}

                        {/* Description */}
                        {isEditMode ? (
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider text-white/60 font-bold ml-1">Description</label>
                                <Textarea
                                    value={data.description || ""}
                                    onChange={(e) => onUpdate({ description: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm min-h-[60px] resize-none focus-visible:ring-1 focus-visible:ring-white/50"
                                    placeholder="Enter your business description..."
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-white/80 leading-relaxed">
                                {description}
                            </p>
                        )}

                        {/* CTA Button */}
                        {isEditMode ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 font-bold ml-1">Button Text</label>
                                    <Input
                                        value={data.ctaButtonText || ""}
                                        onChange={(e) => onUpdate({ ctaButtonText: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm h-auto py-2 focus-visible:ring-1 focus-visible:ring-white/50"
                                        placeholder="View Offers"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 font-bold ml-1">Button Link</label>
                                    <Input
                                        value={data.ctaButtonUrl || ""}
                                        onChange={(e) => onUpdate({ ctaButtonUrl: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm h-auto py-2 focus-visible:ring-1 focus-visible:ring-white/50"
                                        placeholder="https://your-menu.com"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold cursor-pointer hover:bg-white/30 transition-colors">
                                <Eye className="w-4 h-4" />
                                {ctaText}
                                {data.ctaButtonUrl && <ExternalLink className="w-3 h-3 opacity-60" />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Overlay when hidden */}
                {isEditMode && !isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20 pointer-events-none">
                        <span className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                            Currently Hidden
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// Keep backward compatibility export
export interface SpecialOffer {
    title: string;
    description: string;
    isActive: boolean;
}
