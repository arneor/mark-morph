import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import DashboardOverview from "@/pages/DashboardOverview";
import BusinessProfile from "@/pages/BusinessProfile";
import Campaigns from "@/pages/Campaigns";
import Splash from "@/pages/Splash";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Business Dashboard Routes */}
      <Route path="/business/:id" component={DashboardOverview} />
      <Route path="/business/:id/profile" component={BusinessProfile} />
      <Route path="/business/:id/campaigns" component={Campaigns} />
      
      {/* End User Splash Page */}
      <Route path="/splash/:businessId" component={Splash} />
      
      {/* Admin Route */}
      <Route path="/admin" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
