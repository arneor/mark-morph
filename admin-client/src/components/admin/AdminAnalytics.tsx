'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    MousePointerClick,
    Star,
    TrendingUp,
    MapPin,
    ArrowRight,
    Wifi,
    BarChart2,
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
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, AdminAnalyticsData, AdminTrendData } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminAnalytics() {
    const [data, setData] = useState<AdminAnalyticsData | null>(null);
    const [trends, setTrends] = useState<AdminTrendData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardData, trendData] = await Promise.all([
                    adminApi.getDashboardAnalytics(),
                    adminApi.getTrendAnalytics()
                ]);
                setData(dashboardData);
                setTrends(trendData);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
                setError("Failed to load analytics data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        if (adminApi.isAuthenticated()) {
            fetchData();
        }
    }, []);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-full">
                    <Activity className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Analytics Unavailable</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                </Button>
            </div>
        );
    }

    // Handle completely empty data case (e.g. fresh install)
    if (!data || !trends) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 animate-in fade-in">
                <div className="bg-slate-50 p-4 rounded-full">
                    <BarChart2 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No Analytics Data Yet</h3>
                <p className="text-slate-500 max-w-md">
                    Your dashboard will populate as soon as the first user connects to the WiFi network.
                </p>
            </div>
        );
    }

    // Check if we have effectively "zero" data to show a friendly "Getting Started" state
    const isFreshSystem = data.kpis.totalUsers === 0 && data.kpis.totalBusinesses === 0;

    // Check for "real" data presence (non-zero values)
    const hasTrendData = trends?.some(t => t.views > 0 || t.connections > 0);
    const hasHeatMapData = data?.heatMap?.some(h => h.count > 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Network Intelligence
                </h2>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                        Live Data
                    </Badge>
                </div>
            </div>

            {isFreshSystem && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900">Welcome to your new Dashboard!</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            It looks like you&apos;re just getting started. Add your first business and connect a user to see this dashboard come to life.
                        </p>
                    </div>
                </div>
            )}

            {/* A. SMART KPI ROW */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Reach"
                    value={data.kpis.totalUsers.toLocaleString()}
                    icon={Users}
                    description="Verified Users"
                    trend={data.kpis.userGrowth}
                    trendLabel="growth"
                    color="blue"
                />
                <StatCard
                    title="Network Scale"
                    value={data.kpis.activeBusinesses.toString()}
                    icon={Wifi}
                    description="Active Locations"
                    subValue={`of ${data.kpis.totalBusinesses} total`}
                    color="purple"
                />
                <StatCard
                    title="Ad Engagement"
                    value={data.kpis.ctr}
                    icon={MousePointerClick}
                    description="Global CTR"
                    chart={
                        <div className="h-[60px] w-[60px] relative flex items-center justify-center">
                            {/* Simple radial representation using border hack */}
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                            <div
                                className="absolute inset-0 rounded-full border-4 border-indigo-500 border-l-transparent border-b-transparent rotate-45"
                                style={{ transform: `rotate(${parseFloat(data.kpis.ctr) * 3.6}deg)` }}
                            />
                            <span className="text-xs font-bold text-indigo-700">{data.kpis.ctr}</span>
                        </div>
                    }
                />
                <StatCard
                    title="Conversion Potential"
                    value={data.kpis.googleReviewsTriggered.toLocaleString()}
                    icon={Star}
                    description="Review Clicks"
                    trend="+8%"
                    trendLabel="vs last week"
                    color="yellow"
                />
            </div>

            {/* B. TRAFFIC & ENGAGEMENT TRENDS */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 backdrop-blur-md bg-white/80 border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Traffic & Engagement Trends
                        </CardTitle>
                        <CardDescription>
                            Identifying friction: Are people seeing ads but not connecting?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            {hasTrendData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            name="Ad Views"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorViews)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="connections"
                                            name="Wi-Fi Connections"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorConn)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmptyState message="No traffic recorded in the last 7 days" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* D. PEAK ACTIVITY HEATMAP */}
                <Card className="col-span-3 backdrop-blur-md bg-white/80 border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-orange-500" />
                            Peak Activity Heatmap
                        </CardTitle>
                        <CardDescription>
                            Golden Hours: When is the network busiest?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {hasHeatMapData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.heatMap}>
                                        <XAxis
                                            dataKey="hour"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={3}
                                            tickFormatter={(h) => `${h}:00`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-white p-2 shadow-xl text-xs">
                                                            <div className="font-bold text-slate-700">{payload[0].payload.hour}:00 - {payload[0].payload.hour + 1}:00</div>
                                                            <div className="text-orange-500 font-semibold">{payload[0].value} Interactions</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {data.heatMap.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.count > 50 ? '#f97316' : '#fdba74'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmptyState message="No hourly activity data yet" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* C. BUSINESS INTELLIGENCE LEADERBOARD */}
            <Card className="backdrop-blur-md bg-white/80 border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                                Business Intelligence Leaderboard
                            </CardTitle>
                            <CardDescription>Top performing locations based on connections and ad success</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">Export Report</Button>
                    </div>
                </CardHeader>
                <div className="border-t border-slate-100">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50">
                                <TableHead className="w-[300px]">Business</TableHead>
                                <TableHead>Traffic (Connections)</TableHead>
                                <TableHead>Active Sessions</TableHead>
                                <TableHead>Ad Views</TableHead>
                                <TableHead>Ad Success (Clicks)</TableHead>
                                <TableHead className="text-right">Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.businesses.map((business, index) => (
                                <TableRow
                                    key={business.id}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/admin/business/${business.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-bold border border-slate-200">
                                                {index < 3 ? <Star className={`h-4 w-4 ${index === 0 ? 'text-yellow-500 fill-yellow-500' : index === 1 ? 'text-slate-400 fill-slate-400' : 'text-orange-400 fill-orange-400'}`} /> : <span className="text-xs">{index + 1}</span>}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{business.name}</div>
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {business.location}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{business.totalConnections.toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                            {business.activeSessions} active
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{business.stats.views.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-green-600">{business.stats.clicks.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400">
                                                ({business.stats.views > 0 ? ((business.stats.clicks / business.stats.views) * 100).toFixed(1) : 0}%)
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ArrowRight className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div >
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendLabel,
    chart,
    subValue,
    color = "blue"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
    const colors = {
        blue: "text-blue-500 bg-blue-50 border-blue-100",
        purple: "text-purple-500 bg-purple-50 border-purple-100",
        yellow: "text-yellow-500 bg-yellow-50 border-yellow-100",
        indigo: "text-indigo-500 bg-indigo-50 border-indigo-100"
    };

    const colorClass = colors[color as keyof typeof colors] || colors.blue;

    return (
        <Card className="backdrop-blur-md bg-white/80 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{value}</div>
                        {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}
                        <p className="text-xs text-slate-500 mt-1">{description}</p>
                        {trend && (
                            <div className="flex items-center mt-2 text-xs font-medium text-green-600">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                <div className="flex items-center gap-1">
                                    {trend} {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                    {chart && <div className="mb-1">{chart}</div>}
                </div>
            </CardContent>
        </Card>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-white p-3 shadow-xl backdrop-blur-sm bg-white/95">
                <div className="mb-2 border-b pb-1 text-xs font-semibold text-slate-500">
                    {new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Views: {payload[0].value}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Connections: {payload[1].value}
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-[250px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-white/50 border-slate-100">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-4 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <Skeleton className="col-span-4 h-[350px] rounded-xl bg-white/50" />
                <Skeleton className="col-span-3 h-[350px] rounded-xl bg-white/50" />
            </div>
            <Skeleton className="h-[400px] rounded-xl bg-white/50" />
        </div>
    );
}

function ChartEmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <BarChart2 className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
