'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users, Wifi, Megaphone, Loader2, Link2, Eye, MousePointerClick,
    ShoppingBag, Tag, ExternalLink, Share2, TrendingUp, Calendar,
    BarChart3, ArrowUpRight, MessageCircle, X, Check
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useBusinessStats, useBusiness } from '@/hooks/use-businesses';
import { useQuery } from '@tanstack/react-query';
import { beetLinkApi, businessApi, type BeetLinkAnalytics } from '@/lib/api';
import { cn } from '@/lib/utils';

// ===== Date Range Presets =====
type DatePreset = '7d' | '14d' | '30d' | '90d' | 'custom';

const datePresets: { key: DatePreset; label: string }[] = [
    { key: '7d', label: '7 Days' },
    { key: '14d', label: '14 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
];

function getDateRange(preset: DatePreset): { startDate: Date; endDate: Date } {
    const now = new Date();
    const days = preset === '7d' ? 7 : preset === '14d' ? 14 : preset === '30d' ? 30 : 90;
    return {
        startDate: startOfDay(subDays(now, days)),
        endDate: endOfDay(now),
    };
}

// ===== Event Type Labels =====
const eventTypeLabels: Record<string, string> = {
    page_view: 'Page Views',
    category_tap: 'Category Taps',
    product_view: 'Product Views',
    link_click: 'Link Clicks',
    social_click: 'Social Clicks',
    share: 'Shares',
    tab_switch: 'Tab Switches',
    banner_click: 'Banner Clicks',
    gallery_view: 'Gallery Views',
};

const eventTypeIcons: Record<string, React.ReactNode> = {
    page_view: <Eye className="w-4 h-4" />,
    category_tap: <Tag className="w-4 h-4" />,
    product_view: <ShoppingBag className="w-4 h-4" />,
    link_click: <ExternalLink className="w-4 h-4" />,
    social_click: <Link2 className="w-4 h-4" />,
    share: <Share2 className="w-4 h-4" />,
    banner_click: <MousePointerClick className="w-4 h-4" />,
    gallery_view: <Eye className="w-4 h-4" />,
};

// ===== Hook for Beet Link analytics =====
function useBeetLinkAnalytics(businessId: string, startDate: string, endDate: string) {
    return useQuery<BeetLinkAnalytics>({
        queryKey: ['beet-link-analytics', businessId, startDate, endDate],
        queryFn: () => beetLinkApi.getAnalytics(businessId, startDate, endDate),
        enabled: !!businessId,
        staleTime: 60_000, // 1 minute
    });
}

// ===== Main Dashboard Page =====
export default function DashboardOverviewPage() {
    const params = useParams();
    const businessId = params.businessId as string;
    const [activeTab, setActiveTab] = useState<'beet-link' | 'wifi'>('beet-link');

    const { data: business, isLoading: isLoadingBusiness, refetch: refetchBusiness } = useBusiness(businessId);

    // WhatsApp popup state
    const [whatsappDismissed, setWhatsappDismissed] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem(`wa-prompt-dismissed-${businessId}`) === 'true';
    });
    const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
    const [waNumber, setWaNumber] = useState('');
    const [waSaving, setWaSaving] = useState(false);

    const showWhatsAppPrompt = !isLoadingBusiness && business && !business.whatsappNumber && !whatsappDismissed;

    const dismissWhatsAppPrompt = () => {
        setWhatsappDismissed(true);
        setShowWhatsAppPopup(false);
        localStorage.setItem(`wa-prompt-dismissed-${businessId}`, 'true');
    };

    const handleSaveWhatsApp = async () => {
        if (!waNumber.trim()) return;
        setWaSaving(true);
        try {
            await businessApi.update(businessId, {
                whatsappNumber: waNumber.trim(),
                whatsappEnquiryEnabled: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
            await refetchBusiness();
            setShowWhatsAppPopup(false);
            setWhatsappDismissed(true);
            localStorage.setItem(`wa-prompt-dismissed-${businessId}`, 'true');
        } catch {
            // silently fail — user can retry
        } finally {
            setWaSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                        {business?.businessName || 'Overview'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor your digital profile performance and WiFi analytics.
                    </p>
                </div>
                <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-600 shadow-sm">
                    Status:{" "}
                    {isLoadingBusiness ? (
                        <Loader2 className="inline w-3 h-3 animate-spin ml-1" />
                    ) : business?.isActive ? (
                        <span className="text-green-500 font-bold ml-1">● Online</span>
                    ) : (
                        <span className="text-gray-400 font-bold ml-1">● Offline</span>
                    )}
                </div>
            </div>

            {/* WhatsApp Number Prompt */}
            {showWhatsAppPrompt && !showWhatsAppPopup && (
                <div className="relative bg-linear-to-r from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/20 rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Add your WhatsApp number</p>
                        <p className="text-xs text-gray-500 mt-0.5">Let customers enquire about products directly via WhatsApp.</p>
                    </div>
                    <button
                        onClick={() => setShowWhatsAppPopup(true)}
                        className="shrink-0 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#20BD5A] transition-colors shadow-sm"
                    >
                        Set Up
                    </button>
                    <button
                        onClick={dismissWhatsAppPrompt}
                        className="shrink-0 p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* WhatsApp Setup Popup */}
            {showWhatsAppPopup && (
                <div className="relative bg-white border border-[#25D366]/30 rounded-2xl p-5 shadow-lg animate-fade-in space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Set up WhatsApp Enquiry</p>
                                <p className="text-xs text-gray-500">Customers can message you about products</p>
                            </div>
                        </div>
                        <button
                            onClick={dismissWhatsAppPrompt}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 ml-1">WhatsApp Number (with country code)</label>
                        <input
                            type="tel"
                            placeholder="e.g. 919876543210"
                            value={waNumber}
                            onChange={(e) => setWaNumber(e.target.value.replace(/[^\d+]/g, ''))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={dismissWhatsAppPrompt}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleSaveWhatsApp}
                            disabled={!waNumber.trim() || waSaving}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#25D366] rounded-xl hover:bg-[#20BD5A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {waSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {waSaving ? 'Saving...' : 'Save & Enable'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Switcher */}
            <div className="flex items-center bg-white border rounded-xl p-1 w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab('beet-link')}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                        activeTab === 'beet-link'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    )}
                >
                    <Link2 className="w-4 h-4" />
                    Beet Link
                </button>
                <button
                    onClick={() => setActiveTab('wifi')}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                        activeTab === 'wifi'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    )}
                >
                    <Wifi className="w-4 h-4" />
                    WiFi Profile
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'beet-link' ? (
                <BeetLinkTab businessId={businessId} />
            ) : (
                <WiFiProfileTab businessId={businessId} isLoadingBusiness={isLoadingBusiness} />
            )}
        </div>
    );
}

// ===== BEET LINK TAB =====
function BeetLinkTab({ businessId }: { businessId: string }) {
    const [datePreset, setDatePreset] = useState<DatePreset>('7d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const dateRange = useMemo(() => {
        if (datePreset === 'custom' && customStart && customEnd) {
            return {
                startDate: startOfDay(new Date(customStart)),
                endDate: endOfDay(new Date(customEnd)),
            };
        }
        return getDateRange(datePreset);
    }, [datePreset, customStart, customEnd]);

    const { data: analytics, isLoading } = useBeetLinkAnalytics(
        businessId,
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString(),
    );

    if (isLoading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const data = analytics || {
        totalPageViews: 0,
        uniqueSessions: 0,
        eventBreakdown: [],
        dailyTrend: [],
        topCategories: [],
        topProducts: [],
        topLinks: [],
    };

    // Calculate total interactions (all events except page_view)
    const totalInteractions = data.eventBreakdown
        .filter(e => e.eventType !== 'page_view')
        .reduce((sum, e) => sum + e.count, 0);

    return (
        <div className="space-y-6">
            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-white border rounded-lg p-1 shadow-sm">
                    {datePresets.map(preset => (
                        <button
                            key={preset.key}
                            onClick={() => setDatePreset(preset.key)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                                datePreset === preset.key
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-500 hover:text-gray-800'
                            )}
                        >
                            {preset.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setDatePreset('custom')}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                            datePreset === 'custom'
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-500 hover:text-gray-800'
                        )}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </button>
                </div>

                {datePreset === 'custom' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="px-3 py-1.5 border rounded-lg text-xs"
                        />
                        <span className="text-xs text-gray-400">to</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-3 py-1.5 border rounded-lg text-xs"
                        />
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Page Views"
                    value={data.totalPageViews.toLocaleString()}
                    icon={<Eye className="w-5 h-5" />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <KPICard
                    title="Unique Visitors"
                    value={data.uniqueSessions.toLocaleString()}
                    icon={<Users className="w-5 h-5" />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <KPICard
                    title="Total Interactions"
                    value={totalInteractions.toLocaleString()}
                    icon={<MousePointerClick className="w-5 h-5" />}
                    color="text-violet-600"
                    bgColor="bg-violet-50"
                />
                <KPICard
                    title="Engagement Rate"
                    value={data.totalPageViews > 0
                        ? `${Math.round((totalInteractions / data.totalPageViews) * 100)}%`
                        : '0%'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Daily Trend Chart */}
            {data.dailyTrend.length > 0 && (
                <Card className="shadow-lg shadow-black/5 border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Activity Trend</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Views vs interactions over time</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.dailyTrend}>
                                    <defs>
                                        <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            try { return format(new Date(str), "MMM d"); } catch { return str; }
                                        }}
                                        stroke="#888888" fontSize={12} tickLine={false} axisLine={false}
                                    />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            borderRadius: "12px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelFormatter={(label) => {
                                            try { return format(new Date(label), "MMMM d, yyyy"); } catch { return label; }
                                        }}
                                    />
                                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorPageViews)" />
                                    <Area type="monotone" dataKey="interactions" name="Interactions" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorInteractions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Engagement Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Type Summary */}
                <Card className="shadow-lg shadow-black/5 border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Interaction Breakdown</CardTitle>
                        <p className="text-sm text-muted-foreground">How visitors engage with your profile</p>
                    </CardHeader>
                    <CardContent>
                        {data.eventBreakdown.filter(e => e.eventType !== 'page_view').length === 0 ? (
                            <EmptyState message="No interactions recorded yet" />
                        ) : (
                            <div className="space-y-3">
                                {data.eventBreakdown
                                    .filter(e => e.eventType !== 'page_view')
                                    .sort((a, b) => b.count - a.count)
                                    .map(event => {
                                        const pct = totalInteractions > 0
                                            ? Math.round((event.count / totalInteractions) * 100)
                                            : 0;
                                        return (
                                            <div key={event.eventType} className="group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <span className="text-gray-400">
                                                            {eventTypeIcons[event.eventType] || <BarChart3 className="w-4 h-4" />}
                                                        </span>
                                                        {eventTypeLabels[event.eventType] || event.eventType}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-900">{event.count}</span>
                                                        <span className="text-xs text-gray-400">{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/70 rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Items (categories + products combined) */}
                <Card className="shadow-lg shadow-black/5 border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Content</CardTitle>
                        <p className="text-sm text-muted-foreground">Most popular categories and products</p>
                    </CardHeader>
                    <CardContent>
                        {data.topCategories.length === 0 && data.topProducts.length === 0 ? (
                            <EmptyState message="No category or product views yet" />
                        ) : (
                            <div className="space-y-4">
                                {/* Top Categories */}
                                {data.topCategories.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                            <Tag className="w-3 h-3" /> Categories
                                        </h4>
                                        <div className="space-y-2">
                                            {data.topCategories.slice(0, 5).map((cat, i) => (
                                                <TopItemRow key={cat.elementId} rank={i + 1} label={cat.elementLabel} count={cat.count} percentage={cat.percentage} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Products */}
                                {data.topProducts.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-4 flex items-center gap-1.5">
                                            <ShoppingBag className="w-3 h-3" /> Products
                                        </h4>
                                        <div className="space-y-2">
                                            {data.topProducts.slice(0, 5).map((prod, i) => (
                                                <TopItemRow key={prod.elementId} rank={i + 1} label={prod.elementLabel} count={prod.count} percentage={prod.percentage} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Links */}
            {data.topLinks.length > 0 && (
                <Card className="shadow-lg shadow-black/5 border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Links</CardTitle>
                        <p className="text-sm text-muted-foreground">Most clicked links and social profiles</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topLinks.slice(0, 8)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" fontSize={12} stroke="#888888" tickLine={false} axisLine={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="elementLabel"
                                        width={120}
                                        fontSize={11}
                                        stroke="#888888"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#374151' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            borderRadius: "12px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Bar dataKey="count" name="Clicks" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ===== WiFi PROFILE TAB (EXACT copy of existing overview) =====
function WiFiProfileTab({
    businessId,
    isLoadingBusiness,
}: {
    businessId: string;
    isLoadingBusiness: boolean;
}) {
    const { data: stats, isLoading: isLoadingStats } = useBusinessStats(businessId);

    const isLoading = isLoadingBusiness || isLoadingStats;

    if (isLoading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const displayStats = stats || {
        totalConnections: 0,
        activeUsers: 0,
        totalAdsServed: 0,
        totalViews: 0,
        totalClicks: 0,
        ctr: 0,
        revenue: 0,
        connectionsHistory: [],
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Connections"
                    value={displayStats.totalConnections.toLocaleString()}
                    icon={Wifi}
                    trend=""
                    color="text-blue-500"
                />
                <StatsCard
                    title="Active Users"
                    value={displayStats.activeUsers.toString()}
                    icon={Users}
                    trend="Currently online"
                    color="text-green-500"
                />
                <StatsCard
                    title="Ads Served"
                    value={displayStats.totalAdsServed.toLocaleString()}
                    icon={Megaphone}
                    trend=""
                    color="text-purple-500"
                />
            </div>

            {/* Chart Section */}
            <Card className="shadow-lg shadow-black/5 border-border/60">
                <CardHeader>
                    <CardTitle>Connection History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        {displayStats.connectionsHistory.length === 0 || displayStats.connectionsHistory.every(h => h.count === 0) ? (
                            <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <Wifi className="h-10 w-10 text-gray-300 mb-2" />
                                <p className="text-gray-500 font-medium">No connection data available</p>
                                <p className="text-sm text-gray-400">Activity will appear here once users connect.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={displayStats.connectionsHistory}>
                                    <defs>
                                        <linearGradient
                                            id="colorCountWifi"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            try { return format(new Date(str), "MMM d"); } catch { return str; }
                                        }}
                                        stroke="#888888" fontSize={12} tickLine={false} axisLine={false}
                                    />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelFormatter={(label) => {
                                            try { return format(new Date(label), "MMMM d, yyyy"); } catch { return label; }
                                        }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCountWifi)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ===== Reusable Components =====

function KPICard({ title, value, icon, color, bgColor }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}) {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/60">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className={cn('p-2 rounded-xl', bgColor, color)}>{icon}</div>
                </div>
                <div className="text-2xl font-bold font-display">{value}</div>
            </CardContent>
        </Card>
    );
}

function TopItemRow({ rank, label, count, percentage }: {
    rank: number;
    label: string;
    count: number;
    percentage: number;
}) {
    return (
        <div className="flex items-center gap-3 group">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                {rank}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 truncate">{label}</span>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{percentage}%</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    </div>
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-12 text-center">
            <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">{message}</p>
            <p className="text-gray-400 text-xs mt-1">Data will appear here as visitors interact with your profile.</p>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    trend: string;
    color: string;
}

function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="text-2xl font-bold font-display">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            </CardContent>
        </Card>
    );
}
