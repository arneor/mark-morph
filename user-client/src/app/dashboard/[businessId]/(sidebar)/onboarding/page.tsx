'use client';

import { useEffect, useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import { businessApi } from "@/lib/api";
import { Loader2, CheckCircle2, AtSign, Pencil, MessageCircle } from "lucide-react";

const INDUSTRY_OPTIONS = [
    '☕ Café / Coffee Shop',
    '🍽️ Restaurant',
    '🏨 Hotel / Hospitality',
    '💇 Salon / Spa',
    '🏋️ Gym / Fitness',
    '🛒 Retail Store',
    '🏥 Healthcare / Clinic',
    '📚 Education',
    '💼 Coworking Space',
    '🏢 Real Estate',
    '🚗 Automotive',
    '🎨 Creative Agency',
    '💻 Tech / SaaS',
    '🎵 Entertainment',
    '🏖️ Travel / Tourism',
    '🛠️ Home Services',
    '📦 E-commerce',
    '🔧 Other',
];

const wizardSchema = z.object({
    name: z.string().min(1, "Business name is required"),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
    address: z.string().optional(),
    industryType: z.string().min(1, 'Please select your industry'),
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
            username: "",
            address: "",
            contactEmail: "",
            industryType: "",
        },
    });

    // Username availability check
    const [usernameToCheck, setUsernameToCheck] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    useEffect(() => {
        if (!business) return;
        form.reset({
            name: business.businessName || "",
            username: business.username || "",
            address: business.location || "",
            contactEmail: business.contactEmail || "",
            industryType: business.industryType || "",
        });
        if (business.username) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsernameToCheck(business.username);
        }
        if (business.whatsappNumber) {
            setWhatsappNumber(business.whatsappNumber);
        }
    }, [business, form]);

    useEffect(() => {
        const checkUsername = async () => {
            if (!usernameToCheck || usernameToCheck.length < 3) {
                setUsernameStatus('idle');
                return;
            }

            // Don't re-check if it's unchanged from the server
            if (business && business.username === usernameToCheck) {
                setUsernameStatus('available');
                return;
            }

            setUsernameStatus('checking');
            try {
                const response = await businessApi.checkUsername(usernameToCheck);
                setUsernameStatus(response.available ? 'available' : 'taken');

                if (!response.available) {
                    form.setError('username', {
                        type: 'manual',
                        message: 'Username is already taken'
                    });
                } else {
                    form.clearErrors('username');
                }
            } catch (error) {
                console.error('Failed to check username:', error);
                setUsernameStatus('idle');
            }
        };

        const timer = setTimeout(checkUsername, 500);
        return () => clearTimeout(timer);
    }, [usernameToCheck, form, business]);

    const progress = 100;

    const onFinish = form.handleSubmit((values) => {
        updateBusiness.mutate(
            {
                id: businessId,
                businessName: values.name,
                location: values.address?.trim() ? values.address.trim() : null,
                contactEmail: values.contactEmail?.trim() ? values.contactEmail.trim() : null,
                industryType: values.industryType,
                username: values.username,
                onboardingCompleted: true,
                whatsappNumber: whatsappNumber.trim() || undefined,
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

                                {/* Username field with real-time availability */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="your_username"
                                                        className={`pl-10 pr-10 ${usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500/30' :
                                                            usernameStatus === 'taken' ? 'border-red-500 focus-visible:ring-red-500/30' : ''
                                                            }`}
                                                        {...field}
                                                        onChange={(e) => {
                                                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                                            field.onChange(val);
                                                            setUsernameToCheck(val);
                                                        }}
                                                    />
                                                    {usernameStatus === 'checking' && (
                                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                                                    )}
                                                    {usernameStatus === 'available' && (
                                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
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
                                                <Input
                                                    placeholder="contact@business.com"
                                                    type="email"
                                                    {...field}
                                                    readOnly
                                                    className="bg-gray-50 text-muted-foreground cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <div className="text-[10px] text-muted-foreground mt-1 px-1 italic">
                                                Email can be changed in Account Settings.
                                            </div>
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

                                {/* WhatsApp Number (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">
                                        WhatsApp Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                                        <Input
                                            placeholder="e.g. 919876543210"
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^\d+]/g, ''))}
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground px-1 italic">
                                        Include country code. Customers can enquire about products via WhatsApp.
                                    </p>
                                </div>

                                {/* Industry Type - Discrete Display with Popup Editor */}
                                <FormField
                                    control={form.control}
                                    name="industryType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Industry</FormLabel>
                                            <div className="flex items-center gap-3">
                                                <FormControl>
                                                    <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-between">
                                                        <span>{field.value || "Not selected"}</span>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-white border hover:border-primary/20 hover:text-primary transition-all rounded-lg"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl rounded-[32px] bg-white shadow-2xl border-gray-100 p-0 overflow-hidden">
                                                                <DialogHeader className="p-6 pb-0">
                                                                    <DialogTitle className="text-xl font-bold">Select Industry</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="flex flex-wrap gap-2 p-6 max-h-[60vh] overflow-y-auto">
                                                                    {INDUSTRY_OPTIONS.map((industry) => (
                                                                        <button
                                                                            key={industry}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                field.onChange(industry);
                                                                                // Auto-close simulated by state if needed, but DialogTrigger usually handles it
                                                                            }}
                                                                            className={`
                                                                                px-3.5 py-2 rounded-full text-sm font-medium
                                                                                border transition-all duration-200 cursor-pointer
                                                                                ${field.value === industry
                                                                                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.03]'
                                                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-primary/40 hover:text-gray-900'
                                                                                }
                                                                            `}
                                                                        >
                                                                            {industry}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </FormControl>
                                            </div>
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
