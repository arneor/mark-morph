'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    LogOut,
    Menu,
    Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { useLogout } from '@/hooks/use-auth';

interface SidebarProps {
    businessId: string;
}

export function Sidebar({ businessId }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const logout = useLogout();

    const links = [
        {
            href: `/dashboard/${businessId}`,
            label: 'Overview',
            icon: LayoutDashboard,
            exact: true,
        },
        {
            href: `/dashboard/${businessId}/onboarding`,
            label: 'Setup Wizard',
            icon: Wand2,
        },
        {
            href: `/dashboard/${businessId}/profile`,
            label: 'Business Profile',
            icon: Store,
        },
    ];

    const renderNavContent = () => (
        <div className="flex flex-col h-full py-6">
            <div className="px-6 mb-8">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    MarkMorph
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Business Portal
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {links.map((link) => {
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
            </nav>

            <div className="px-4 mt-auto">
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
                    <span className="font-display font-bold text-lg text-gray-900">MarkMorph</span>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen border-r bg-card/50 backdrop-blur sticky top-0">
                {renderNavContent()}
            </aside>
        </>
    );
}
