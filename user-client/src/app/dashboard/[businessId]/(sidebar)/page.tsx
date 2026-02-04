'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wifi, Megaphone, Loader2 } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useBusinessStats, useBusiness } from '@/hooks/use-businesses';

export default function DashboardOverviewPage() {
    const params = useParams();
    const businessId = params.businessId as string;

    const { data: business, isLoading: isLoadingBusiness } = useBusiness(businessId);
    const { data: stats, isLoading: isLoadingStats } = useBusinessStats(businessId);

    const isLoading = isLoadingBusiness || isLoadingStats;

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Fallback stats if API fails or returns null
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
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                        {business?.businessName || 'Overview'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here&apos;s what&apos;s happening with your WiFi network today.
                    </p>
                </div>
                <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-600 shadow-sm">
                    Status:{" "}
                    {business?.isActive ? (
                        <span className="text-green-500 font-bold ml-1">● Online</span>
                    ) : (
                        <span className="text-gray-400 font-bold ml-1">● Offline</span>
                    )}
                </div>
            </div>

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
                                            id="colorCount"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            try {
                                                return format(new Date(str), "MMM d");
                                            } catch {
                                                return str;
                                            }
                                        }}
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelFormatter={(label) => {
                                            try {
                                                return format(new Date(label), "MMMM d, yyyy");
                                            } catch {
                                                return label;
                                            }
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
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
