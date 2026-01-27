import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Wifi, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export default function Landing() {
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.role === "business" && user.businessId) {
          setLocation(`/business/${user.businessId}`);
        } else if (user.role === "admin") {
          setLocation("/admin");
        } else {
          // Default demo redirect
          setLocation("/business/1"); 
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Column: Marketing */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Wifi className="w-4 h-4" />
            <span>Smart WiFi Advertising</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight tracking-tight">
            Turn your <span className="text-primary">Free WiFi</span> into a Marketing Engine.
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Capture emails, show targeted ads, and grow your business while providing seamless connectivity to your customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium">Easy Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium">Brand Customization</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>Enter your username to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. cafe_owner" 
                            {...field} 
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : (
                      <>
                        Sign In <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-4">Or try the demo splash page:</p>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => setLocation("/splash/1")}
                >
                  View Mobile Splash Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
