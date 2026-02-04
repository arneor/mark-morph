'use client';

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";

const wizardSchema = z.object({
    name: z.string().min(1, "Business name is required"),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
    address: z.string().optional(),
});

type WizardValues = z.infer<typeof wizardSchema>;

export default function BusinessOnboarding() {
    const params = useParams();
    const businessId = params.businessId as string;
    const router = useRouter();

    const { toast } = useToast();
    const { data: business } = useBusiness(businessId);
    const updateBusiness = useUpdateBusiness();

    const form = useForm<WizardValues>({
        resolver: zodResolver(wizardSchema),
        defaultValues: {
            name: "",
            address: "",
            contactEmail: "",
        },
    });

    useEffect(() => {
        if (!business) return;
        form.reset({
            name: business.businessName || "",
            address: business.location || "",
            contactEmail: business.contactEmail || "",
        });
    }, [business, form]);

    // No multi-step, so progress is 100%
    const progress = 100;

    const onFinish = form.handleSubmit((values) => {
        updateBusiness.mutate(
            {
                id: businessId,
                businessName: values.name,
                location: values.address?.trim() ? values.address.trim() : null,
                contactEmail: values.contactEmail?.trim() ? values.contactEmail.trim() : null,
                onboardingCompleted: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            {
                onSuccess: () => {
                    toast({
                        title: "Setup Complete",
                        description: "Your business profile has been saved.",
                    });
                    router.push(`/dashboard/${businessId}`);
                },
            },
        );
    });

    return (
        <div className="flex-1 p-6 md:p-8 lg:p-10">
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
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>
                            Tell us about your venue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-6">
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
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@business.com" type="email" {...field} />
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

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="button"
                                        onClick={onFinish}
                                        disabled={updateBusiness.isPending}
                                    >
                                        {updateBusiness.isPending ? "Saving..." : "Finish"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
