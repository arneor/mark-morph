import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import DashboardOverview from "@/pages/DashboardOverview";
import BusinessProfile from "@/pages/BusinessProfile";

import BusinessOnboarding from "@/pages/BusinessOnboarding";
import Splash from "@/pages/Splash";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminBusinessDetails from "@/pages/AdminBusinessDetails";
import HowItWorks from "@/pages/HowItWorks";
import LocalLanding from "@/pages/LocalLanding";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* SEO Pages */}
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/wifi-marketing/:city" component={LocalLanding} />

      {/* Business Dashboard Routes */}
      <Route path="/business/:id/onboarding" component={BusinessOnboarding} />
      <Route path="/business/:id/profile" component={BusinessProfile} />

      <Route path="/business/:id" component={DashboardOverview} />

      {/* End User Splash Page */}
      <Route path="/splash/:businessId" component={Splash} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/business/:id" component={AdminBusinessDetails} />

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
