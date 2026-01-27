import { useParams } from "wouter";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useBusinessStats } from "@/hooks/use-businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Wifi, DollarSign, Megaphone } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function DashboardOverview() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const { data: stats, isLoading } = useBusinessStats(businessId);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar businessId={businessId} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />
      
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Overview</h1>
              <p className="text-muted-foreground mt-1">Here's what's happening with your WiFi network today.</p>
            </div>
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-600 shadow-sm">
              Status: <span className="text-green-500 font-bold ml-1">● Online</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Connections" 
              value={stats.totalConnections.toLocaleString()} 
              icon={Wifi} 
              trend="+12% from last week"
              color="text-blue-500"
            />
            <StatsCard 
              title="Active Users" 
              value={stats.activeUsers.toString()} 
              icon={Users} 
              trend="Currently online"
              color="text-green-500"
            />
            <StatsCard 
              title="Ads Served" 
              value={stats.totalAdsServed.toLocaleString()} 
              icon={Megaphone} 
              trend="+8% from last week"
              color="text-purple-500"
            />
            <StatsCard 
              title="Est. Revenue" 
              value={`$${stats.revenue.toLocaleString()}`} 
              icon={DollarSign} 
              trend="Mock revenue data"
              color="text-orange-500"
            />
          </div>

          {/* Chart Section */}
          <Card className="shadow-lg shadow-black/5 border-border/60">
            <CardHeader>
              <CardTitle>Connection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.connectionsHistory}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => format(new Date(str), "MMM d")}
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
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, color }: any) {
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
