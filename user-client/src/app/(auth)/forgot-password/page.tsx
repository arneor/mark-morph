'use client';

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
    ArrowLeft
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

import { useToast } from '@/hooks/use-toast';
import { useForgotPassword, useResetPassword } from '@/hooks/use-auth';
import { SignInPage, GlassInputWrapper } from '@/components/ui/sign-in';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);

    const emailForm = useForm<EmailValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    const resetForm = useForm<ResetValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: { otp: '', newPassword: '' },
    });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        if (otpExpiresIn > 0) {
            const timer = setTimeout(() => setOtpExpiresIn(otpExpiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpExpiresIn]);

    const { mutate: forgotPassword, isPending: isRequesting } = useForgotPassword();
    const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

    const onSubmitEmail = (data: EmailValues) => {
        forgotPassword(data.email, {
            onSuccess: () => {
                setEmail(data.email);
                setStep('reset');
                setCountdown(60);
                setOtpExpiresIn(600);
            },
        });
    };

    const onSubmitReset = (data: ResetValues) => {
        resetPassword({
            email,
            otp: data.otp,
            newPassword: data.newPassword,
        }, {
            onSuccess: (data) => {
                setStep('success');
                const businessId = data.businessId;
                toast({
                    title: 'Password Reset Successful!',
                    description: businessId
                        ? 'Your password has been updated. Redirecting to your dashboard...'
                        : 'Your password has been updated. Please set up your business profile.',
                });
                setTimeout(() => {
                    if (businessId) {
                        router.push(`/dashboard/${businessId}`);
                    } else {
                        router.push('/signup');
                    }
                }, 2000);
            },
            onError: (error: Error) => {
                toast({
                    title: 'Reset Failed',
                    description: error.message || 'Invalid or expired code',
                    variant: 'destructive',
                });
            }
        });
    };

    const handleResend = () => {
        if (countdown > 0) return;
        forgotPassword(email, {
            onSuccess: () => {
                setCountdown(60);
                setOtpExpiresIn(600);
                resetForm.setValue('otp', '');
            },
        });
    };

    const isLoading = isRequesting || isResetting;

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
                        Password Reset <CheckCircle2 className="w-8 h-8" />
                    </span>
                ) : step === 'reset' ? (
                    "Reset Password"
                ) : (
                    "Forgot Password"
                )
            }
            description={
                step === 'success'
                    ? "Redirecting to sign in..."
                    : step === 'reset'
                        ? <span>Enter the code sent to <span className="font-medium text-primary">{email}</span></span>
                        : "Enter your email to receive a password reset code"
            }
            heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        >
            {step === 'email' && (
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5">
                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="animate-element animate-delay-300">
                                    <FormLabel className="text-sm font-medium text-muted-foreground">Email Address</FormLabel>
                                    <FormControl>
                                        <GlassInputWrapper>
                                            <input
                                                type="email"
                                                placeholder="yourname@example.com"
                                                className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                                {...field}
                                            />
                                        </GlassInputWrapper>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="animate-element animate-delay-400 w-full rounded-2xl bg-primary py-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                            ) : (
                                <>Send Reset Code <ArrowRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="animate-element animate-delay-500 w-full text-muted-foreground hover:text-foreground"
                            onClick={() => router.push('/login')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                        </Button>
                    </form>
                </Form>
            )}

            {step === 'reset' && (
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-5">
                        <FormField
                            control={resetForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center animate-element animate-delay-300">
                                    <FormLabel className="text-sm font-medium text-muted-foreground mb-2">Reset Code</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
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
                            <p className="text-center text-sm text-muted-foreground">
                                Code expires in <span className="font-medium text-primary">{formatTime(otpExpiresIn)}</span>
                            </p>
                        )}

                        <FormField
                            control={resetForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem className="animate-element animate-delay-400">
                                    <FormLabel className="text-sm font-medium text-muted-foreground">New Password</FormLabel>
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

                        <Button
                            type="submit"
                            className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base"
                            // eslint-disable-next-line react-hooks/incompatible-library
                            disabled={isLoading || resetForm.watch('otp').length !== 6}
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Resetting...</>
                            ) : (
                                <>Reset Password <ArrowRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>

                        <div className="flex flex-col items-center gap-2">
                            <Button
                                type="button" variant="ghost" className="h-auto"
                                onClick={handleResend} disabled={countdown > 0 || isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}

            {step === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-element animate-delay-300 py-10">
                    <div className="animate-bounce">
                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </div>
                    <p className="text-muted-foreground">Redirecting to sign in...</p>
                </div>
            )}
        </SignInPage>
    );
}
