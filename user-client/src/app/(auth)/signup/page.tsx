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
    Loader2,
    CheckCircle2,
    RefreshCw,
    Eye,
    EyeOff,
    MapPin,
    AtSign,
    Store,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { SignInPage, GlassInputWrapper } from '@/components/ui/sign-in';

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

// Validation schema for business details
const signupSchema = z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    location: z.string().min(2, 'Location is required'),
    industryType: z.string().min(1, 'Please select your industry'),
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
    const [showPassword, setShowPassword] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('');

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
            industryType: '',
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

    // Username check state
    const [usernameToCheck, setUsernameToCheck] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    // Debounced username check (500ms)
    useEffect(() => {
        const checkUsername = async () => {
            if (!usernameToCheck || usernameToCheck.length < 3) {
                setUsernameStatus('idle');
                return;
            }

            setUsernameStatus('checking');
            try {
                const response = await businessApi.checkUsername(usernameToCheck);
                setUsernameStatus(response.available ? 'available' : 'taken');

                if (!response.available) {
                    signupForm.setError('username', {
                        type: 'manual',
                        message: 'Username is already taken'
                    });
                } else {
                    signupForm.clearErrors('username');
                }
            } catch (error) {
                console.error('Failed to check username:', error);
                setUsernameStatus('idle');
            }
        };

        const timer = setTimeout(checkUsername, 500);
        return () => clearTimeout(timer);
    }, [usernameToCheck, signupForm]);

    // Handle initial signup (send OTP)
    const onSubmitDetails = async (data: SignupValues) => {
        setIsLoading(true);

        try {
            // Final check on username before submitting
            const check = await businessApi.checkUsername(data.username);
            if (!check.available) {
                signupForm.setError('username', {
                    type: 'manual',
                    message: 'Username is already taken'
                });
                setIsLoading(false);
                return;
            }

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

            // Handle edge case: User signed up before but failed to register business
            if (err.message && err.message.toLowerCase().includes('already')) {
                try {
                    // Try to log them in transparently
                    const loginResponse = await authApi.login({
                        email: data.email,
                        password: data.password,
                    });

                    if (loginResponse.success) {
                        setBusinessData(data);
                        setStep('otp');
                        setCountdown(60);
                        setOtpExpiresIn(600); // 10 mins

                        toast({
                            title: 'Welcome Back!',
                            description: `We've sent a new verification code to ${data.email}`,
                        });
                        return; // Exit the catch block early on successful login
                    }
                } catch {
                    // Login failed (likely wrong password)
                    toast({
                        title: 'Email Already Registered',
                        description: 'Please sign in or use the correct password to continue.',
                        variant: 'destructive',
                    });
                    return;
                }
            }

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
            await authApi.verifyOtp(businessData.email, data.otp);

            const business = await businessApi.register({
                businessName: businessData.businessName,
                username: businessData.username,
                location: businessData.location,
                contactEmail: businessData.email,
                industryType: businessData.industryType,
                ...(whatsappNumber.trim() ? { whatsappNumber: whatsappNumber.trim() } : {}),
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const businessId = business.id || (business as any)._id;

            if (!businessId) {
                throw new Error('Business registration failed - no ID returned');
            }

            // Save WhatsApp number if provided during signup
            if (whatsappNumber.trim()) {
                try {
                    await businessApi.update(businessId, {
                        whatsappNumber: whatsappNumber.trim(),
                        whatsappEnquiryEnabled: true,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any);
                } catch {
                    // Non-blocking — WhatsApp can be set up later
                }
            }

            setStep('success');
            toast({
                title: 'Account Created!',
                description: 'Your business profile is ready.',
            });

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
            await authApi.signup({
                email: businessData.email,
                password: businessData.password,
            }); // Re-trigger registration email logic

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

    const selectedIndustry = signupForm.watch('industryType');

    return (
        <SignInPage
            title={
                step === 'success' ? (
                    <span className="text-green-500 flex items-center gap-3">
                        Success <CheckCircle2 className="w-8 h-8" />
                    </span>
                ) : step === 'otp' ? (
                    "Verify Email"
                ) : (
                    "Create Account"
                )
            }
            description={
                step === 'success' ? (
                    "Your account has been created successfully."
                ) : step === 'otp' ? (
                    <span>Enter the code sent to <span className="font-medium text-primary">{businessData?.email}</span></span>
                ) : (
                    "Start your WiFi marketing journey today"
                )
            }
            heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"

        >
            {/* Step 1: Business Details */}
            {step === 'details' && (
                <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSubmitDetails)} className="space-y-4">
                        <div className="flex flex-col gap-4">
                            {/* Business Name */}
                            <FormField
                                control={signupForm.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem className="animate-element animate-delay-100">
                                        <FormLabel className="text-sm font-medium text-muted-foreground">Business Name</FormLabel>
                                        <FormControl>
                                            <GlassInputWrapper>
                                                <div className="relative">
                                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        placeholder="The Coffee House"
                                                        className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none"
                                                        {...field}
                                                    />
                                                </div>
                                            </GlassInputWrapper>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username */}
                                <FormField
                                    control={signupForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="animate-element animate-delay-200">
                                            <FormLabel className="text-sm font-medium text-muted-foreground">Username</FormLabel>
                                            <FormControl>
                                                <GlassInputWrapper>
                                                    <div className="relative">
                                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            placeholder="linkbeet"
                                                            className={`w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none ${usernameStatus === 'checking' ? 'text-muted-foreground' :
                                                                usernameStatus === 'available' ? 'text-green-500' :
                                                                    usernameStatus === 'taken' ? 'text-red-500' : ''
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
                                                </GlassInputWrapper>
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
                                        <FormItem className="animate-element animate-delay-200">
                                            <FormLabel className="text-sm font-medium text-muted-foreground">Location</FormLabel>
                                            <FormControl>
                                                <GlassInputWrapper>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            placeholder="City, State"
                                                            className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none"
                                                            {...field}
                                                        />
                                                    </div>
                                                </GlassInputWrapper>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Industry Type - Pill Selector */}
                            <FormField
                                control={signupForm.control}
                                name="industryType"
                                render={({ field }) => (
                                    <FormItem className="animate-element animate-delay-250">
                                        <FormLabel className="text-sm font-medium text-muted-foreground">Industry</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 pb-1 scrollbar-thin">
                                                {INDUSTRY_OPTIONS.map((industry) => (
                                                    <button
                                                        key={industry}
                                                        type="button"
                                                        onClick={() => field.onChange(industry)}
                                                        className={`
                                                            px-3 py-1.5 rounded-full text-xs font-medium
                                                            border transition-all duration-200 cursor-pointer
                                                            focus:outline-none focus:ring-2 focus:ring-primary/40
                                                            ${selectedIndustry === industry
                                                                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
                                                                : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/80 hover:border-primary/40 hover:text-foreground'
                                                            }
                                                        `}
                                                    >
                                                        {industry}
                                                    </button>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={signupForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="animate-element animate-delay-300">
                                        <FormLabel className="text-sm font-medium text-muted-foreground">Email Address</FormLabel>
                                        <FormControl>
                                            <GlassInputWrapper>
                                                <input
                                                    type="email"
                                                    placeholder="owner@business.com"
                                                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                                    {...field}
                                                />
                                            </GlassInputWrapper>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={signupForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="animate-element animate-delay-400">
                                        <FormLabel className="text-sm font-medium text-muted-foreground">Password</FormLabel>
                                        <FormControl>
                                            <GlassInputWrapper>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-3 flex items-center"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                                        )}
                                                    </button>
                                                </div>
                                            </GlassInputWrapper>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* WhatsApp Number (Optional) */}
                            <div className="animate-element animate-delay-400">
                                <label className="text-sm font-medium text-muted-foreground">WhatsApp Number <span className="text-xs text-muted-foreground/60">(Optional)</span></label>
                                <GlassInputWrapper>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                                        <input
                                            type="tel"
                                            placeholder="e.g. 919876543210"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^\d+]/g, ''))}
                                            className="w-full bg-transparent text-sm p-4 pl-10 rounded-2xl focus:outline-none"
                                        />
                                    </div>
                                </GlassInputWrapper>
                                <p className="text-xs text-muted-foreground/60 mt-1 ml-1">Include country code. Customers can enquire about products via WhatsApp.</p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>

                        <p className="animate-element animate-delay-600 text-center text-sm text-muted-foreground mt-4">
                            Already have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="text-primary hover:underline transition-colors font-medium">
                                Sign In
                            </a>
                        </p>
                    </form>
                </Form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
                <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-6">
                        <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center animate-element animate-delay-300">
                                    <FormControl>
                                        <InputOTP
                                            maxLength={6}
                                            value={field.value}
                                            onChange={field.onChange}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                                <InputOTPSlot index={1} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                                <InputOTPSlot index={2} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                                <InputOTPSlot index={3} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                                <InputOTPSlot index={4} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                                <InputOTPSlot index={5} className="h-12 w-12 sm:h-14 sm:w-14 text-lg" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {otpExpiresIn > 0 ? (
                            <p className="text-center text-sm text-muted-foreground animate-element animate-delay-400">
                                Code expires in{' '}
                                <span className="font-medium text-primary">
                                    {formatTime(otpExpiresIn)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-center text-sm text-destructive animate-element animate-delay-400">
                                Code expired
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base"
                            disabled={isLoading || otpForm.watch('otp').length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify & Create Account <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>

                        <div className="flex flex-col items-center gap-2 animate-element animate-delay-600">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-auto"
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="h-auto text-muted-foreground text-sm hover:text-primary"
                                onClick={handleBack}
                            >
                                Use a different email
                            </Button>
                        </div>
                    </form>
                </Form>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-element animate-delay-300 py-10">
                    <div className="animate-bounce">
                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">You&apos;re All Set!</h2>
                        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
                    </div>
                </div>
            )}
        </SignInPage>
    );
}
