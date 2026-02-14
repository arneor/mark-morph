
import {
    Wifi,
    MapPin,
    Pencil,
    Camera,
    Check,
    X,
} from "lucide-react";
import { useState, useRef } from "react";
import { useEditMode } from "./EditModeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Business } from "@/lib/api";


interface HeaderUpdate extends Partial<Business> {
    logoFile?: File;
}

interface EditableProfileHeaderProps {
    business: Business;
    onUpdate: (updates: HeaderUpdate) => void;
}

export function EditableProfileHeader({
    business,
    onUpdate,
}: EditableProfileHeaderProps) {
    const { isEditMode } = useEditMode();
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [tempName, setTempName] = useState(business.businessName);
    const [tempAddress, setTempAddress] = useState(business.location || "");
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        if (isEditMode && logoInputRef.current) {
            logoInputRef.current.click();
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onUpdate({ logoUrl: url, logoFile: file });
        }
    };

    const saveName = () => {
        onUpdate({ businessName: tempName });
        setIsEditingName(false);
    };

    const saveAddress = () => {
        onUpdate({ location: tempAddress });
        setIsEditingAddress(false);
    };

    const cancelName = () => {
        setTempName(business.businessName);
        setIsEditingName(false);
    };

    const cancelAddress = () => {
        setTempAddress(business.location || "");
        setIsEditingAddress(false);
    };

    return (
        <div
            className="px-6 pt-8 pb-4 text-center relative animate-fade-in"
        >
            {/* Logo with glowing ring */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="absolute inset-0 rounded-full gradient-lime-cyan opacity-30 blur-xl animate-pulse" />
                <div
                    className={`relative w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ${isEditMode ? "cursor-pointer" : ""
                        }`}
                    onClick={handleLogoClick}
                >
                    {business.logoUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={business.logoUrl}
                                alt={business.businessName}
                                className="w-full h-full object-cover"
                            />
                        </>
                    ) : (
                        <Wifi className="w-10 h-10 text-white" />
                    )}

                    {/* Edit overlay for logo */}
                    {isEditMode && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    )}
                </div>

                {/* Hidden file input for logo */}
                <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                />

                {/* Edit badge */}
                {isEditMode && (
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#9EE53B] flex items-center justify-center shadow-lg border-2 border-white animate-fade-in"
                    >
                        <Pencil className="w-4 h-4 text-[#222]" />
                    </div>
                )}
            </div>

            {/* Business Name */}
            <div className="relative mb-1 group">
                {!isEditingName ? (
                    <div
                        className={`relative inline-flex items-center gap-2 ${isEditMode ? "cursor-pointer hover:opacity-80" : ""
                            }`}
                        onClick={() => isEditMode && setIsEditingName(true)}
                    >
                        <h1 className="text-2xl font-display font-extrabold text-white">
                            {business.businessName}
                        </h1>
                        {isEditMode && (
                            <Pencil className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                ) : (
                    <div
                        className="flex items-center gap-2 justify-center animate-fade-in"
                    >
                        <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-48 h-10 text-center bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            placeholder="Business name"
                            autoFocus
                        />
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-[#9EE53B] hover:bg-[#9EE53B]/90"
                            onClick={saveName}
                        >
                            <Check className="w-4 h-4 text-[#222]" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                            onClick={cancelName}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Location */}
            <div className="relative group">
                {!isEditingAddress ? (
                    <div
                        className={`flex items-center justify-center gap-1.5 text-white/70 text-sm ${isEditMode ? "cursor-pointer hover:text-white/90" : ""
                            }`}
                        onClick={() => isEditMode && setIsEditingAddress(true)}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{business.location || "Add your location"}</span>
                        {isEditMode && (
                            <Pencil className="w-3 h-3 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                ) : (
                    <div
                        className="flex items-center gap-2 justify-center animate-fade-in"
                    >
                        <Input
                            value={tempAddress}
                            onChange={(e) => setTempAddress(e.target.value)}
                            className="w-60 h-9 text-center text-sm bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            placeholder="Enter address"
                            autoFocus
                        />
                        <Button
                            size="icon"
                            className="h-9 w-9 rounded-full bg-[#9EE53B] hover:bg-[#9EE53B]/90"
                            onClick={saveAddress}
                        >
                            <Check className="w-4 h-4 text-[#222]" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                            onClick={cancelAddress}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    Free WiFi
                </div>
            </div>
        </div>
    );
}
