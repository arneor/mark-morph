'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
    ArrowRight,
    Store,
    MapPin,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { authApi, businessApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Validation schema for business details
const signupSchema = z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    location: z.string().min(2, 'Location is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Validation schema for OTP
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

type SignupValues = z.infer<typeof signupSchema>;
type OtpValues = z.infer<typeof otpSchema>;

type Step = 'details' | 'otp' | 'success';

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Steps: details -> otp -> success
    const [step, setStep] = useState<Step>('details');
    const [isLoading, setIsLoading] = useState(false);

    // Business Data
    const [businessData, setBusinessData] = useState<SignupValues | null>(null);

    // OTP helpers
    const [countdown, setCountdown] = useState(0);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);

    // Form for business details
    const signupForm = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            businessName: '',
            username: '',
            location: '',
            email: '',
            password: '',
        },
    });

    // Form for OTP
    const otpForm = useForm<OtpValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: '',
        },
    });

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // OTP expiry timer
    useEffect(() => {
        if (otpExpiresIn > 0) {
            const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpExpiresIn]);

    // Handle initial signup (send OTP)
    const onSubmitDetails = async (data: SignupValues) => {
        setIsLoading(true);
        try {
            // Check if email exists or start signup flow
            // Since the API requires registering first to get OTP in some flows,
            // we'll assume a "initiate signup" endpoint or use the register endpoint directly
            // which might send OTP if configured.
            // However, based on the previous context, we might need to register first.
            // Let's assume `authApi.register` sends OTP.

            // Only send email and password to the signup endpoint
            // The business name and location are used later in the registration step
            const response = await authApi.signup({
                email: data.email,
                password: data.password,
            });

            if (response.success) {
                setBusinessData(data);
                setStep('otp');
                setCountdown(60);
                setOtpExpiresIn(600); // 10 mins

                toast({
                    title: 'Verification Code Sent',
                    description: `We've sent a code to ${data.email}`,
                });
            }
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Signup Failed',
                description: err.message || 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification & Completion
    const onSubmitOtp = async (data: OtpValues) => {
        if (!businessData) return;

        setIsLoading(true);
        try {
            // Verify OTP
            await authApi.verifyOtp(businessData.email, data.otp);

            // Now register the business
            const business = await businessApi.register({
                businessName: businessData.businessName,
                username: businessData.username,
                location: businessData.location,
                contactEmail: businessData.email,
            });

            // Get the business ID (handle both id and _id from backend)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const businessId = business.id || (business as any)._id;

            if (!businessId) {
                throw new Error('Business registration failed - no ID returned');
            }

            setStep('success');
            toast({
                title: 'Account Created!',
                description: 'Your business profile is ready.',
            });

            // Redirect to dashboard after delay
            setTimeout(() => {
                router.push(`/dashboard/${businessId}`);
            }, 2000);
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Verification Failed',
                description: err.message || 'Invalid or expired OTP',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (!businessData || countdown > 0) return;

        setIsLoading(true);
        try {
            // Ideally trigger a resend endpoint
            // For now, re-calling register might trigger resend or use a specific resend endpoint if available
            // Assuming authApi.resendOtp exists or similar. checking authApi...
            // If not, we can re-call register/login logic
            await authApi.signup(businessData); // Re-trigger registration email logic

            setCountdown(60);
            setOtpExpiresIn(600);
            otpForm.reset();

            toast({
                title: 'Code Resent',
                description: 'A new verification code has been sent.',
            });
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Failed to Resend',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('details');
        otpForm.reset();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50" />

            <div className="w-full max-w-lg z-10">
                {/* Step 1: Business Details */}
                {step === 'details' && (
                    <div className="animate-fade-in">
                        <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-display flex items-center gap-2">
                                    <Store className="w-6 h-6 text-primary" />
                                    Create Business Account
                                </CardTitle>
                                <CardDescription>
                                    Start your WiFi marketing journey today
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...signupForm}>
                                    <form
                                        onSubmit={signupForm.handleSubmit(onSubmitDetails)}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Business Name */}
                                            <FormField
                                                control={signupForm.control}
                                                name="businessName"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Business Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. The Coffee House"
                                                                className="h-11"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Username */}
                                            <FormField
                                                control={signupForm.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2 md:col-span-1">
                                                        <FormLabel>Username</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">@</span>
                                                                <Input
                                                                    placeholder="markmorph"
                                                                    className="pl-7 h-11"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Location */}
                                            <FormField
                                                control={signupForm.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2 md:col-span-1">
                                                        <FormLabel>Location / City</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="New York, NY"
                                                                    className="pl-9 h-11"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Email & Password */}
                                            <FormField
                                                control={signupForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="owner@business.com"
                                                                className="h-11"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signupForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Password</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                className="h-11"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-[#9EE53B] text-[#0a0a1a] hover:bg-[#8CD032]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    Continue{' '}
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="pt-2 text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-auto px-0"
                                                asChild
                                            >
                                                <Link href="/login">
                                                    Already have an account? Sign in
                                                </Link>
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2: OTP */}
                {step === 'otp' && (
                    <div className="animate-fade-in">
                        <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 -ml-2"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <CardTitle className="text-xl font-display">
                                        Verify Email
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Enter the 6-digit code sent to{' '}
                                    <span className="font-medium text-foreground">
                                        {businessData?.email}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...otpForm}>
                                    <form
                                        onSubmit={otpForm.handleSubmit(onSubmitOtp)}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={otpForm.control}
                                            name="otp"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-center">
                                                    <FormControl>
                                                        <InputOTP
                                                            maxLength={6}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        >
                                                            <InputOTPGroup>
                                                                <InputOTPSlot index={0} />
                                                                <InputOTPSlot index={1} />
                                                                <InputOTPSlot index={2} />
                                                                <InputOTPSlot index={3} />
                                                                <InputOTPSlot index={4} />
                                                                <InputOTPSlot index={5} />
                                                            </InputOTPGroup>
                                                        </InputOTP>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="text-center text-sm text-muted-foreground">
                                            {otpExpiresIn > 0 ? (
                                                <p>
                                                    Code expires in{' '}
                                                    <span className="font-medium text-primary">
                                                        {formatTime(otpExpiresIn)}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-destructive">Code expired</p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-[#9EE53B] text-[#0a0a1a] hover:bg-[#8CD032]"
                                            disabled={isLoading || otpForm.watch('otp').length !== 6}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Verify & Create Account{' '}
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={handleResendOtp}
                                                disabled={countdown > 0 || isLoading}
                                            >
                                                <RefreshCw
                                                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''
                                                        }`}
                                                />
                                                {countdown > 0
                                                    ? `Resend available in ${countdown}s`
                                                    : 'Resend Verification Code'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <div className="animate-fade-in">
                        <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-display font-semibold mb-2">
                                    You&apos;re All Set!
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    Your business account has been created successfully.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Redirecting to your dashboard...
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
