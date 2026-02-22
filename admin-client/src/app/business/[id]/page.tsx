'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, beetLinkAnalyticsApi, type BeetLinkAnalytics } from '@/lib/api';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    TrendingUp,
    Eye,
    MousePointer2,
    Heart,
    Share2,
    Maximize2,
    Wifi,
    Megaphone,
    Loader2,
    Shield,
    LucideIcon,
    Link2,
    Users,
    Tag,
    ShoppingBag,
    ExternalLink,
    BarChart3,
    ArrowUpRight,
    MousePointerClick,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Interface for interaction logs since it's typed as unknown[] in api.ts
interface InteractionLog {
    id: string;
    timestamp: string;
    interactionType: string;
    userName?: string;
    userEmail?: string;
    deviceType?: string;
}

export default function AdminBusinessDetailsPage() {
    const params = useParams();
    const router = useRouter();
    // Ensure businessId is treated as string, handling potential array case
    const businessId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Redirect if no ID
    useEffect(() => {
        if (!businessId) {
            router.push('/dashboard');
        }
    }, [businessId, router]);

    // Auth check
    useEffect(() => {
        if (isMounted && !adminApi.isAuthenticated()) {
            router.push('/login');
        }
    }, [router, isMounted]);

    const { data: business, isLoading, error } = useQuery({
        queryKey: ['admin-business-details', businessId],
        queryFn: async () => {
            if (!businessId) throw new Error('No business ID');
            return await adminApi.getBusinessDetails(businessId);
        },
        enabled: isMounted && !!businessId && adminApi.isAuthenticated(),
    });

    const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
    const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    // Leaderboard tab state
    const [leaderboardTab, setLeaderboardTab] = useState<'wifi-splash' | 'beet-link'>('wifi-splash');
    const [beetLinkDatePreset, setBeetLinkDatePreset] = useState<'7d' | '14d' | '30d' | '90d'>('7d');

    const beetLinkDateRange = useMemo(() => {
        const days = beetLinkDatePreset === '7d' ? 7 : beetLinkDatePreset === '14d' ? 14 : beetLinkDatePreset === '30d' ? 30 : 90;
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);
        return { startDate: start.toISOString(), endDate: now.toISOString() };
    }, [beetLinkDatePreset]);

    const { data: beetLinkAnalytics, isLoading: isBeetLinkLoading } = useQuery<BeetLinkAnalytics>({
        queryKey: ['beet-link-analytics', businessId, beetLinkDateRange.startDate, beetLinkDateRange.endDate],
        queryFn: () => beetLinkAnalyticsApi.getAnalytics(businessId!, beetLinkDateRange.startDate, beetLinkDateRange.endDate),
        enabled: isMounted && !!businessId && leaderboardTab === 'beet-link',
        staleTime: 60_000,
    });

    const handleViewLogs = async (adId: string) => {
        setSelectedAdId(adId);
        setIsLogsLoading(true);
        try {
            // Cast result to expected type
            const logs = await adminApi.getAdInteractionDetails(adId) as InteractionLog[];
            setInteractionLogs(logs);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setIsLogsLoading(false);
        }
    };

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const toggleBeetLinkSuspendedMutation = useMutation({
        mutationFn: (suspend: boolean) => suspend ? adminApi.suspendBeetLink(businessId as string, 'Admin action') : adminApi.unsuspendBeetLink(businessId as string),
        onSuccess: (_, suspend) => {
            queryClient.invalidateQueries({ queryKey: ['admin-business-details', businessId] });
            toast({ title: 'Success', description: `Beet Link ${suspend ? 'suspended' : 'unsuspended'}.` });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed to toggle Beet Link suspension', variant: 'destructive' });
        }
    });

    const approveBeetLinkMutation = useMutation({
        mutationFn: () => adminApi.approveBeetLink(businessId as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-business-details', businessId] });
            toast({ title: 'Success', description: `Beet Link approved.` });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed to approve Beet Link', variant: 'destructive' });
        }
    });

    const toggleSplashSuspendedMutation = useMutation({
        mutationFn: (suspend: boolean) => suspend ? adminApi.suspendSplash(businessId as string, 'Admin action') : adminApi.unsuspendSplash(businessId as string),
        onSuccess: (_, suspend) => {
            queryClient.invalidateQueries({ queryKey: ['admin-business-details', businessId] });
            toast({ title: 'Success', description: `Splash Page ${suspend ? 'suspended' : 'unsuspended'}.` });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed to toggle Splash suspension', variant: 'destructive' });
        }
    });

    // Prevent hydration mismatch
    if (!isMounted) {
        return <DetailsSkeleton />;
    }

    if (isLoading) {
        return <DetailsSkeleton />;
    }

    if (error || !business) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-gray-50">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Business</h2>
                <p className="text-muted-foreground mb-4">Could not load business details.</p>
                <Button onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Navigation Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="text-sm text-muted-foreground">Business Intelligence</div>
                </div>

                {/* Business Header Profile */}
                <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl border shadow-sm">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border relative">
                        {business.logoUrl ? (
                            <Image src={business.logoUrl} alt="Logo" fill className="object-cover" />
                        ) : (
                            <Building2 className="w-10 h-10 opacity-50" />
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-display font-bold text-gray-900">{business.businessName}</h1>
                                <StatusBadge status={business.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {business.location || 'No Location'}
                                </div>
                                {business.category && (
                                    <Badge variant="secondary" className="font-normal">
                                        {business.category}
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Joined {new Date(business.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" /> Owner
                                </div>
                                <div className="font-medium">{business.ownerEmail || '—'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" /> Contact
                                </div>
                                <div className="font-medium">{business.ownerPhone || '—'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <Wifi className="w-3.5 h-3.5" /> Connections
                                </div>
                                <div className="font-medium">{business.connectionCount || 0}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <Megaphone className="w-3.5 h-3.5" /> Active Ads
                                </div>
                                <div className="font-medium">{business.adsCount || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Controls */}
                <Card className="border shadow-sm bg-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-500" />
                            Access Controls
                        </CardTitle>
                        <CardDescription>Manage visibility and access to this business&apos;s digital touchpoints</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-gray-900">Beet Link Profile</h4>
                                {business.status === 'pending_approval' && (
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50/50">
                                        <div className="space-y-0.5">
                                            <Label>Pending Approval</Label>
                                            <p className="text-xs text-muted-foreground">The business is not yet approved.</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => approveBeetLinkMutation.mutate()}
                                            disabled={approveBeetLinkMutation.isPending}
                                        >
                                            Approve Profile
                                        </Button>
                                    </div>
                                )}
                                {(business.status === 'active' || business.isBeetLinkSuspended) && (
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="font-semibold text-gray-800">Suspend Beet Link</Label>
                                            <p className="text-xs text-muted-foreground">Hide profile from public view.</p>
                                        </div>
                                        <Switch
                                            checked={business.isBeetLinkSuspended}
                                            onCheckedChange={(checked) => toggleBeetLinkSuspendedMutation.mutate(checked)}
                                            disabled={toggleBeetLinkSuspendedMutation.isPending || business.status !== 'active'}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-gray-900">WiFi Splash Page</h4>
                                <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="font-semibold text-gray-800">Suspend Splash Page</Label>
                                        <p className="text-xs text-muted-foreground">Disable WiFi captive portal.</p>
                                    </div>
                                    <Switch
                                        checked={business.isSplashSuspended}
                                        onCheckedChange={(checked) => toggleSplashSuspendedMutation.mutate(checked)}
                                        disabled={toggleSplashSuspendedMutation.isPending || (business.status !== 'active' && business.status !== 'suspended')}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="Total Ad Views"
                        value={business.totalAdViews}
                        icon={Eye}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Total Clicks"
                        value={business.totalAdClicks}
                        icon={MousePointer2}
                        color="bg-purple-50 text-purple-600"
                    />
                    <StatCard
                        title="Total Likes"
                        value={business.totalAdLikes}
                        icon={Heart}
                        color="bg-red-50 text-red-600"
                    />
                    <StatCard
                        title="Total Shares"
                        value={business.totalAdShares}
                        icon={Share2}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="Gallery Expands"
                        value={business.totalAdExpands}
                        icon={Maximize2}
                        color="bg-orange-50 text-orange-600"
                    />
                </div>

                {/* Engagement Leaderboard — Tabbed */}
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-linear-to-r from-gray-900 to-gray-800 text-white pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    Engagement Leaderboard
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Track performance across your digital touchpoints
                                </CardDescription>
                            </div>
                        </div>
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 mt-3 bg-white/10 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => setLeaderboardTab('wifi-splash')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${leaderboardTab === 'wifi-splash'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Wifi className="w-4 h-4" />
                                WiFi Splash
                            </button>
                            <button
                                onClick={() => setLeaderboardTab('beet-link')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${leaderboardTab === 'beet-link'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Link2 className="w-4 h-4" />
                                Beet Link
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* ===== WiFi Splash Tab (existing, untouched) ===== */}
                        {leaderboardTab === 'wifi-splash' && (
                            <>
                                {business.topPosts && business.topPosts.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {business.topPosts.map((post, index) => (
                                            <div key={post.id} className="p-4 flex items-center hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-center w-8 font-bold text-gray-400 mr-4">
                                                    #{index + 1}
                                                </div>
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border mr-4 relative">
                                                    {post.mediaUrl ? (
                                                        <Image src={post.mediaUrl} fill className="object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-200" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <h4 className="font-semibold text-gray-900 truncate">{post.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {post.status}
                                                        </Badge>
                                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent" onClick={() => handleViewLogs(post.id)}>
                                                            View Logs
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="text-center w-12 hidden md:block">
                                                        <div className="text-gray-500 text-xs mb-0.5">Views</div>
                                                        <div className="font-medium">{post.views}</div>
                                                    </div>
                                                    <div className="text-center w-12 text-blue-600 hidden md:block">
                                                        <div className="text-blue-400 text-xs mb-0.5">Clicks</div>
                                                        <div className="font-bold">{post.clicks}</div>
                                                    </div>
                                                    <div className="text-center w-12 text-red-600 hidden sm:block">
                                                        <div className="text-red-400 text-xs mb-0.5">Likes</div>
                                                        <div className="font-bold">{post.likes}</div>
                                                    </div>
                                                    <div className="text-center w-12 text-green-600 hidden sm:block">
                                                        <div className="text-green-400 text-xs mb-0.5">Shares</div>
                                                        <div className="font-bold">{post.shares}</div>
                                                    </div>
                                                    <div className="text-center w-12 text-orange-600 hidden sm:block">
                                                        <div className="text-orange-400 text-xs mb-0.5">Taps</div>
                                                        <div className="font-bold">{post.expands}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground">
                                        No active advertisements or data found.
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== Beet Link Tab ===== */}
                        {leaderboardTab === 'beet-link' && (
                            <div className="p-6 space-y-6">
                                {/* Date Range Presets */}
                                <div className="flex items-center gap-1 bg-gray-50 border rounded-lg p-1 w-fit">
                                    {(['7d', '14d', '30d', '90d'] as const).map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => setBeetLinkDatePreset(preset)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${beetLinkDatePreset === preset
                                                ? 'bg-gray-900 text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                                }`}
                                        >
                                            {preset === '7d' ? '7 Days' : preset === '14d' ? '14 Days' : preset === '30d' ? '30 Days' : '90 Days'}
                                        </button>
                                    ))}
                                </div>

                                {isBeetLinkLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <BeetLinkAnalyticsContent analytics={beetLinkAnalytics} />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div >

            <Dialog open={!!selectedAdId} onOpenChange={(open) => !open && setSelectedAdId(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle>Interaction Logs</DialogTitle>
                        <DialogDescription>
                            Detailed list of user interactions for this ad.
                        </DialogDescription>
                    </DialogHeader>

                    {isLogsLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Loading logs...</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Interaction</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Device</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {interactionLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.interactionType}</Badge>
                                            </TableCell>
                                            <TableCell>{log.userName || '—'}</TableCell>
                                            <TableCell>{log.userEmail || '—'}</TableCell>
                                            <TableCell>{log.deviceType || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {interactionLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No interaction logs found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Subcomponents

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: LucideIcon; color: string }) {
    return (
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {value > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-2xl font-bold">{value?.toLocaleString() || 0}</h3>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-500 hover:bg-green-600">Active Business</Badge>;
        case 'pending_approval':
            return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending Approval</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'suspended':
            return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Suspended</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function DetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                </div>
                <div className="flex gap-6 bg-white p-6 rounded-xl border">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Separator />
                        <div className="grid grid-cols-4 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        </div>
    )
}

// ===== Beet Link Analytics Subcomponents =====

const beetLinkEventLabels: Record<string, string> = {
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

const beetLinkEventIcons: Record<string, LucideIcon> = {
    page_view: Eye,
    category_tap: Tag,
    product_view: ShoppingBag,
    link_click: ExternalLink,
    social_click: Link2,
    share: Share2,
    banner_click: MousePointerClick,
    gallery_view: Eye,
};

function BeetLinkAnalyticsContent({ analytics }: { analytics?: BeetLinkAnalytics }) {
    const data = analytics || {
        totalPageViews: 0,
        uniqueSessions: 0,
        eventBreakdown: [],
        dailyTrend: [],
        topCategories: [],
        topProducts: [],
        topLinks: [],
    };

    const totalInteractions = data.eventBreakdown
        .filter(e => e.eventType !== 'page_view')
        .reduce((sum, e) => sum + e.count, 0);

    const engagementRate = data.totalPageViews > 0
        ? Math.round((totalInteractions / data.totalPageViews) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <BeetLinkKPICard title="Page Views" value={data.totalPageViews} icon={Eye} color="text-blue-600" bgColor="bg-blue-50" />
                <BeetLinkKPICard title="Unique Visitors" value={data.uniqueSessions} icon={Users} color="text-emerald-600" bgColor="bg-emerald-50" />
                <BeetLinkKPICard title="Total Interactions" value={totalInteractions} icon={MousePointerClick} color="text-violet-600" bgColor="bg-violet-50" />
                <BeetLinkKPICard title="Engagement Rate" value={engagementRate} icon={TrendingUp} color="text-orange-600" bgColor="bg-orange-50" suffix="%" />
            </div>

            {/* Interaction Breakdown + Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interaction Breakdown */}
                <div className="border rounded-xl p-5 bg-gray-50/50">
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        Interaction Breakdown
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">How visitors engage with this profile</p>
                    {data.eventBreakdown.filter(e => e.eventType !== 'page_view').length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">No interactions recorded yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {data.eventBreakdown
                                .filter(e => e.eventType !== 'page_view')
                                .sort((a, b) => b.count - a.count)
                                .map(event => {
                                    const pct = totalInteractions > 0 ? Math.round((event.count / totalInteractions) * 100) : 0;
                                    const IconComp = beetLinkEventIcons[event.eventType] || BarChart3;
                                    return (
                                        <div key={event.eventType}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <IconComp className="w-3.5 h-3.5 text-gray-400" />
                                                    {beetLinkEventLabels[event.eventType] || event.eventType}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{event.count}</span>
                                                    <span className="text-xs text-gray-400">{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-800 rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Top Content */}
                <div className="border rounded-xl p-5 bg-gray-50/50">
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        Top Content
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">Most popular categories and products</p>
                    {data.topCategories.length === 0 && data.topProducts.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">No category or product views yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {data.topCategories.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" /> Categories
                                    </h5>
                                    <div className="space-y-2">
                                        {data.topCategories.slice(0, 5).map((cat, i) => (
                                            <TopItemRow key={cat.elementId} rank={i + 1} label={cat.elementLabel} count={cat.count} percentage={cat.percentage} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {data.topProducts.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-3 flex items-center gap-1.5">
                                        <ShoppingBag className="w-3 h-3" /> Products
                                    </h5>
                                    <div className="space-y-2">
                                        {data.topProducts.slice(0, 5).map((prod, i) => (
                                            <TopItemRow key={prod.elementId} rank={i + 1} label={prod.elementLabel} count={prod.count} percentage={prod.percentage} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Links */}
            {data.topLinks.length > 0 && (
                <div className="border rounded-xl p-5 bg-gray-50/50">
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        Top Links
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">Most clicked links and social profiles</p>
                    <div className="space-y-2">
                        {data.topLinks.slice(0, 8).map((link, i) => (
                            <TopItemRow key={link.elementId} rank={i + 1} label={link.elementLabel} count={link.count} percentage={link.percentage} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BeetLinkKPICard({ title, value, icon: Icon, color, bgColor, suffix }: {
    title: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    suffix?: string;
}) {
    return (
        <div className="border rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{title}</p>
                <div className={`p-1.5 rounded-lg ${bgColor} ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
                {value.toLocaleString()}{suffix || ''}
            </div>
        </div>
    );
}

function TopItemRow({ rank, label, count, percentage }: {
    rank: number;
    label: string;
    count: number;
    percentage: number;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
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
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gray-700 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

