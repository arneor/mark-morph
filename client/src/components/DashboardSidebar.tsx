import { Link, useLocation } from "wouter";
import { LayoutDashboard, Store, Megaphone, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  businessId: number;
}

export function DashboardSidebar({ businessId }: SidebarProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/business/${businessId}`, label: "Overview", icon: LayoutDashboard },
    { href: `/business/${businessId}/profile`, label: "Business Profile", icon: Store },
    { href: `/business/${businessId}/campaigns`, label: "Ad Campaigns", icon: Megaphone },
  ];

  const NavContent = () => (
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
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/5 rounded-xl transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 bg-background/80 backdrop-blur border rounded-lg shadow-md">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen border-r bg-card/50 backdrop-blur sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}
