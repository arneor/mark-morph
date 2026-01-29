import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";

type WizardStep = 1 | 2;

const wizardSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  address: z.string().optional(),
  wifiSsid: z.string().optional(),
  profileType: z.enum(["private", "public"]).optional(),
});

type WizardValues = z.infer<typeof wizardSchema>;



export default function BusinessOnboarding() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const { data: business } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [step, setStep] = useState<WizardStep>(1);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      address: "",
      wifiSsid: "",
      profileType: "private",
    },
  });

  useEffect(() => {
    if (!business) return;
    form.reset({
      name: business.name || "",
      address: business.address || "",
      wifiSsid: business.wifiSsid || "",
      profileType: (business.profileType as any) || "private",
    });
  }, [business, form]);

  const progress = useMemo(() => {
    const idx = step - 1;
    return Math.round(((idx + 1) / 2) * 100);
  }, [step]);

  const saveCurrent = (next?: WizardStep) => {
    if (next) setStep(next);
  };

  const onNext = () => {
    if (step === 1) return saveCurrent(2);
    return undefined;
  };

  const onBack = () => {
    if (step === 2) setStep(1);
  };

  const previewValues = form.watch();

  const onFinish = form.handleSubmit((values) => {
    updateBusiness.mutate(
      {
        id: businessId,
        name: values.name,
        address: values.address?.trim() ? values.address.trim() : null,
        wifiSsid: values.wifiSsid?.trim() ? values.wifiSsid.trim() : null,
        profileType: values.profileType || "private",
        onboardingCompleted: true,
      } as any,
      {
        onSuccess: () => {
          toast({
            title: "Setup Complete",
            description: "Your business profile has been saved.",
          });
          saveCurrent(2);
          setLocation(`/business/${businessId}`);
        },
      },
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Setup Wizard
            </h1>
            <p className="text-muted-foreground">
              Complete your business profile to launch your splash portal.
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Step 1: Basic Information"}
                {step === 2 && "Step 2: Configuration"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your venue."}
                {step === 2 && "Configure WiFi and Ad settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your business name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="wifiSsid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network SSID</FormLabel>
                            <FormControl>
                              <Input placeholder="Guest_WiFi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="profileType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile mode</FormLabel>
                            <Select
                              value={field.value || "private"}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="private">
                                  Private (only your ads)
                                </SelectItem>
                                <SelectItem value="public">
                                  Public (mix + revenue sharing)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-md border p-4 bg-background">
                        {form.watch("profileType") === "private" ? (
                          <div className="space-y-2">
                            <p className="font-medium">Private profile mode</p>
                            <p className="text-sm text-muted-foreground">
                              Your splash page will show only your own campaigns
                              and branding.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-medium">Public profile mode</p>
                            <p className="text-sm text-muted-foreground">
                              Your splash page can show your content + platform
                              ads with revenue sharing.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      disabled={step === 1}
                    >
                      Back
                    </Button>

                    {step < 2 ? (
                      <Button type="button" onClick={onNext}>
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={onFinish}
                        disabled={updateBusiness.isPending}
                      >
                        {updateBusiness.isPending ? "Saving..." : "Finish"}
                      </Button>
                    )}
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
