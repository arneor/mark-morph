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
    EyeOff
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

// Validation schema for login credentials
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Validation schema for OTP
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginValues = z.infer<typeof loginSchema>;
type OtpValues = z.infer<typeof otpSchema>;

type Step = 'credentials' | 'otp' | 'success';



export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('credentials');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [password, setPassword] = useState(''); // Kept for state consistency if needed
    const [showPassword, setShowPassword] = useState(false);

    const [countdown, setCountdown] = useState(0);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);

    // Form for credentials
    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    // Form for OTP
    const otpForm = useForm<OtpValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    // Countdown timer for resend OTP
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

    // Handle credentials submission
    const onSubmitCredentials = async (data: LoginValues) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(data);

            if (response.success) {
                setEmail(data.email);
                setPassword(data.password);
                setStep('otp');
                setCountdown(60);
                setOtpExpiresIn(600);

                toast({
                    title: 'OTP Sent!',
                    description: `Verification code sent to ${data.email}`,
                });
            }
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Login Failed',
                description: err.message || 'Invalid credentials',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification
    const onSubmitOtp = async (data: OtpValues) => {
        setIsLoading(true);
        try {
            await authApi.verifyOtp(email, data.otp);

            // Try to get user's business
            let businessId: string | null = null;
            try {
                const businessResponse = await businessApi.getMyBusiness();
                if (businessResponse) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    businessId = businessResponse.id || (businessResponse as any)._id;
                }
            } catch {
                // No business found
            }

            setStep('success');

            toast({
                title: 'Welcome back!',
                description: 'You have been signed in successfully.',
            });

            // Redirect based on user's business status
            setTimeout(() => {
                if (businessId) {
                    router.push(`/dashboard/${businessId}`);
                } else {
                    toast({
                        title: 'Create Your Business',
                        description: "Let's set up your business profile.",
                    });
                    router.push('/signup');
                }
            }, 1500);
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

    // Handle resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        try {
            const response = await authApi.login({ email, password: loginForm.getValues('password') }); // Use form value

            if (response.success) {
                setCountdown(60);
                setOtpExpiresIn(600);
                otpForm.reset();

                toast({
                    title: 'OTP Resent!',
                    description: `New verification code sent to ${email}`,
                });
            }
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Failed to resend OTP',
                description: err.message || 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to credentials step
    const handleBack = () => {
        setStep('credentials');
        otpForm.reset();
    };

    // Format countdown time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                    "Welcome Back"
                )
            }
            description={
                step === 'success' ? (
                    "Redirecting to your dashboard..."
                ) : step === 'otp' ? (
                    <span>Enter the code sent to <span className="font-medium text-primary">{email}</span></span>
                ) : (
                    "Sign in to your LinkBeet dashboard"
                )
            }
            heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
            onCreateAccount={() => router.push('/signup')}
        >
            {/* Step 1: Credentials */}
            {step === 'credentials' && (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onSubmitCredentials)} className="space-y-5">
                        <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="animate-element animate-delay-300">
                                    <FormLabel className="text-sm font-medium text-muted-foreground">Email Address</FormLabel>
                                    <FormControl>
                                        <GlassInputWrapper>
                                            <input
                                                className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                                placeholder="yourname@example.com"
                                                {...field}
                                            />
                                        </GlassInputWrapper>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="animate-element animate-delay-400">
                                    <FormLabel className="text-sm font-medium text-muted-foreground">Password</FormLabel>
                                    <FormControl>
                                        <GlassInputWrapper>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                                                    placeholder="••••••••"
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

                        <div className="animate-element animate-delay-400 flex items-center justify-between text-sm">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="custom-checkbox accent-primary h-4 w-4 rounded border-border" />
                                <span className="text-foreground/80 group-hover:text-foreground transition-colors">Keep me signed in</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => router.push('/forgot-password')}
                                className="text-primary hover:text-primary/80 hover:underline transition-all font-semibold"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
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

                        {otpExpiresIn > 0 && (
                            <p className="text-center text-sm text-muted-foreground animate-element animate-delay-400">
                                Code expires in{' '}
                                <span className="font-medium text-primary">
                                    {formatTime(otpExpiresIn)}
                                </span>
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
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Verify & Sign In <ArrowRight className="w-5 h-5 ml-2" />
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
                    <p className="text-muted-foreground">You are being redirected...</p>
                </div>
            )}
        </SignInPage>
    );
}
