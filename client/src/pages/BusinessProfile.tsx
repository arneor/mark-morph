import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { insertBusinessSchema } from "@shared/schema";

// Create a partial schema for updates, picking relevant fields
const profileFormSchema = insertBusinessSchema.pick({
  name: true,
  address: true,
  wifiSsid: true,
  primaryColor: true,
  logoUrl: true
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function BusinessProfile() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const { data: business, isLoading } = useBusiness(businessId);
  const updateMutation = useUpdateBusiness();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      address: "",
      wifiSsid: "",
      primaryColor: "#000000",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (business) {
      form.reset({
        name: business.name || "",
        address: business.address || "",
        wifiSsid: business.wifiSsid || "",
        primaryColor: business.primaryColor || "#000000",
        logoUrl: business.logoUrl || "",
      });
    }
  }, [business, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate({ id: businessId, ...data });
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />
      
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Business Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your venue details and branding.</p>
          </div>

          <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <CardDescription>This information appears on your splash page.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Joe's Coffee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wifiSsid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WiFi SSID (Network Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Joes_Free_WiFi" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Color</FormLabel>
                          <div className="flex gap-3">
                            <FormControl>
                              <div className="relative flex-1">
                                <div 
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border shadow-sm"
                                  style={{ backgroundColor: field.value || "#000000" }}
                                />
                                <Input className="pl-12" {...field} value={field.value || "#000000"} />
                              </div>
                            </FormControl>
                            <Input 
                              type="color" 
                              className="w-12 h-10 p-1 cursor-pointer" 
                              {...field} 
                              value={field.value || "#000000"} 
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={updateMutation.isPending}
                      className="min-w-[140px]"
                    >
                      {updateMutation.isPending ? "Saving..." : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
