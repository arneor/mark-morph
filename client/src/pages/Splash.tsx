import { useParams, useLocation } from "wouter";
import { useSplashData, useConnectWifi } from "@/hooks/use-splash";
import { SplashCarousel } from "@/components/SplashCarousel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wifi, Facebook, Mail, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Splash() {
  const { businessId } = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(businessId || "0");
  const { data, isLoading, error } = useSplashData(id);
  const connectMutation = useConnectWifi();
  const { toast } = useToast();
  const [connectStep, setConnectStep] = useState<"idle" | "connecting" | "success">("idle");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-4">Could not load the WiFi login page.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const { business, campaigns } = data;

  const handleConnect = () => {
    setConnectStep("connecting");
    connectMutation.mutate(
      { businessId: id, deviceType: "mobile" },
      {
        onSuccess: (res) => {
          setConnectStep("success");
          setTimeout(() => {
            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
            } else {
              toast({ title: "Connected!", description: "You are now online." });
              setLocation("/"); // Redirect to landing or success page
            }
          }, 1500);
        },
        onError: () => {
          setConnectStep("idle");
          toast({ title: "Connection Failed", description: "Please try again.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Mobile container - max width constraints */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative">
        
        {/* Header / Brand Area */}
        <div className="px-6 pt-12 pb-6 text-center space-y-4 bg-gradient-to-b from-white to-gray-50">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-inner">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Wifi className="w-10 h-10 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">{business.name}</h1>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{business.address || "Free Guest WiFi"}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 pb-8 space-y-8">
          
          {/* Ad Carousel */}
          <SplashCarousel campaigns={campaigns} />

          {/* Connection Actions */}
          <div className="space-y-4">
            {connectStep === "idle" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Button 
                  onClick={handleConnect}
                  className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: business.primaryColor || undefined }}
                >
                  Connect to WiFi
                </Button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or login with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => handleConnect()}>
                    <Facebook className="w-5 h-5 mr-2 text-blue-600" /> Facebook
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => handleConnect()}>
                    <Mail className="w-5 h-5 mr-2 text-gray-600" /> Email
                  </Button>
                </div>
              </motion.div>
            )}

            {connectStep === "connecting" && (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-gray-500 font-medium">Authenticating...</p>
              </div>
            )}

            {connectStep === "success" && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Wifi className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Connected!</h3>
                  <p className="text-gray-500">Redirecting you...</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Secondary CTA */}
          <Card className="bg-gray-50 border-none shadow-inner p-4 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Enjoying your visit?</p>
            <Button variant="link" className="text-primary h-auto p-0 font-semibold">
              Leave us a Google Review &rarr;
            </Button>
          </Card>
        </div>

        {/* Footer */}
        <div className="py-4 text-center text-xs text-gray-400 border-t">
          Powered by MarkMorph
        </div>
      </div>
    </div>
  );
}
