'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    LogOut,
    Menu,
    Wand2,
    Wifi,
    Link2,
    ChevronDown,
    Settings,
    QrCode,
    PhoneCall,
    MessageCircle,
    HelpCircle,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import { useLogout } from '@/hooks/use-auth';
import { useBusiness } from '@/hooks/use-businesses';


interface SidebarProps {
    businessId: string;
}

export function Sidebar({ businessId }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const logout = useLogout();
    const { data: business } = useBusiness(businessId);

    // Support WhatsApp link generation with business data
    const getWhatsAppUrl = () => {
        const baseMsg = "Hi Support, I need some help with my Linkbeet dashboard.";
        if (!business) return `https://wa.me/919744880311?text=${encodeURIComponent(baseMsg)}`;

        const businessInfo = `\n\n--- Business Details ---\nName: ${business.businessName}\nID: ${business.id}\nEmail: ${business.contactEmail || 'N/A'}\nLocation: ${business.location || 'N/A'}\nUsername: ${business.username || 'N/A'}`;

        return `https://wa.me/919744880311?text=${encodeURIComponent(baseMsg + businessInfo)}`;
    };

    // Check if we're on any profile page
    const isOnProfilePage = pathname.includes('/profile') || pathname.includes('/beet-link');
    const [profileOpen, setProfileOpen] = useState(isOnProfilePage);

    // Keep dropdown open when navigating to profile pages
    useEffect(() => {
        if (isOnProfilePage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProfileOpen(prev => prev ? prev : true);
        }
    }, [isOnProfilePage]);

    const mainLinks = [
        {
            href: `/dashboard/${businessId}`,
            label: 'Overview',
            icon: LayoutDashboard,
            exact: true,
        },
        {
            href: `/dashboard/${businessId}/offers`,
            label: 'Offers',
            icon: Tag,
        },
        {
            href: `/dashboard/${businessId}/onboarding`,
            label: 'Setup Wizard',
            icon: Wand2,
        },
        {
            href: `/dashboard/${businessId}/marketing`,
            label: 'Share & Promote',
            icon: QrCode,
        },
        {
            href: `/dashboard/${businessId}/settings`,
            label: 'Settings',
            icon: Settings,
        },
    ];

    const profileLinks = [
        {
            href: `/dashboard/${businessId}/beet-link`,
            label: 'Beet Link',
            icon: Link2,
        },
        {
            href: `/dashboard/${businessId}/profile`,
            label: 'WiFi Profile',
            icon: Wifi,
        },
    ];

    const renderNavContent = () => (
        <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
            <div className="px-6 mb-8 shrink-0">
                <h1 className="text-2xl font-display font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    LinkBeet
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Business Portal
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto min-h-0">
                {/* Main Navigation Links */}
                {mainLinks.map((link) => {
                    const isActive = link.exact
                        ? pathname === link.href
                        : pathname.startsWith(link.href);

                    return (
                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <link.icon
                                    className={cn(
                                        'w-5 h-5',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-muted-foreground group-hover:text-foreground',
                                    )}
                                />
                                {link.label}
                            </div>
                        </Link>
                    );
                })}

                {/* Business Profile Dropdown */}
                <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
                    <CollapsibleTrigger asChild>
                        <button
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group',
                                isOnProfilePage
                                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Store
                                className={cn(
                                    'w-5 h-5',
                                    isOnProfilePage
                                        ? 'text-primary'
                                        : 'text-muted-foreground group-hover:text-foreground',
                                )}
                            />
                            <span className="flex-1 text-left">Business Profile</span>
                            <div
                                className="transition-transform duration-200"
                                style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div
                            className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-4 animate-fade-in"
                        >
                            {profileLinks.map((link) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                    >
                                        <div
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group',
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <link.icon
                                                className={cn(
                                                    'w-4 h-4',
                                                    isActive
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground group-hover:text-foreground',
                                                )}
                                            />
                                            <span className="text-sm">{link.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </nav>

            <div className="px-4 mt-auto space-y-4 pt-4 border-t border-muted shrink-0">
                {/* Help & Support Section - More compact version */}
                <div className="p-3 bg-muted/30 rounded-2xl mx-1">
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Support</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        <a
                            href={getWhatsAppUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-white border border-slate-100 hover:bg-[#25D366]/5 hover:border-[#25D366]/20 transition-all text-slate-600 hover:text-[#25D366]"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">WhatsApp</span>
                        </a>
                        <a
                            href="tel:9744880311"
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-white border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all text-slate-600 hover:text-primary"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Call</span>
                        </a>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/5 rounded-xl transition-colors cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-white/80 backdrop-blur-md z-50 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 border-r bg-white">
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            {renderNavContent()}
                        </SheetContent>
                    </Sheet>
                    <span className="font-display font-bold text-lg text-gray-900">LinkBeet</span>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen border-r bg-card/50 backdrop-blur sticky top-0">
                {renderNavContent()}
            </aside>
        </>
    );
}

