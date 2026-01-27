import { Link } from "wouter";
import { Users, BarChart3, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Platform Admin</h1>
            <p className="text-muted-foreground">System-wide overview and management.</p>
          </div>
          <Link href="/">
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground">Log Out</a>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,240</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="p-4 text-center text-muted-foreground">
                Administrative table view placeholder
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
