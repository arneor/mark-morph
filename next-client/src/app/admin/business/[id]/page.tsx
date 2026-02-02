'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi, AdminBusinessDetails as AdminBusinessDetailsType } from '@/lib/api';
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
    LucideIcon
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
            router.push('/admin/dashboard');
        }
    }, [businessId, router]);

    // Auth check
    useEffect(() => {
        if (isMounted && !adminApi.isAuthenticated()) {
            router.push('/admin/login');
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
                <Button onClick={() => router.push('/admin/dashboard')}>
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
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="text-sm text-muted-foreground">Business Intelligence</div>
                </div>

                {/* Business Header Profile */}
                <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl border shadow-sm">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border">
                        {business.logoUrl ? (
                            <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
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

                {/* Top Performing Content */}
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-linear-to-r from-gray-900 to-gray-800 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    Engagement Leaderboard
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Top performing ads ranked by engagement score
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {business.topPosts && business.topPosts.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {business.topPosts.map((post, index) => (
                                    <div key={post.id} className="p-4 flex items-center hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-center w-8 font-bold text-gray-400 mr-4">
                                            #{index + 1}
                                        </div>
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border mr-4">
                                            {post.mediaUrl ? (
                                                <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
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
                    </CardContent>
                </Card>

            </div>

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
