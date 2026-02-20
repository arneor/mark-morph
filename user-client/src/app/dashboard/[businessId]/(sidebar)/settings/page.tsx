'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { authApi } from '@/lib/api';
import {
    Loader2,
    Eye,
    EyeOff,
    Shield,
    Mail,
    CheckCircle2,
    RefreshCw,
} from 'lucide-react';

// ===== CHANGE PASSWORD SCHEMAS =====
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ===== EMAIL CHANGE SCHEMAS =====
const emailChangeSchema = z.object({
    newEmail: z.string().email('Please enter a valid email address'),
});

const emailOtpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

type EmailChangeValues = z.infer<typeof emailChangeSchema>;
type EmailOtpValues = z.infer<typeof emailOtpSchema>;

export default function SettingsPage() {
    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                    Account Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your password and email preferences.
                </p>
            </div>

            <div className="grid gap-8 max-w-2xl">
                <ChangePasswordSection />
                <EmailChangeSection />
            </div>
        </div>
    );
}

// ===== CHANGE PASSWORD SECTION =====

function ChangePasswordSection() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: ChangePasswordValues) => {
        setIsLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast({
                title: 'Password Changed',
                description: 'Your password has been updated successfully.',
            });
            form.reset();
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Failed',
                description: err.message || 'Could not change password.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showCurrent ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                className="absolute inset-y-0 right-3 flex items-center"
                                            >
                                                {showCurrent ? (
                                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute inset-y-0 right-3 flex items-center"
                                            >
                                                {showNew ? (
                                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

// ===== EMAIL CHANGE SECTION =====

function EmailChangeSection() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
    const [newEmail, setNewEmail] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);

    const emailForm = useForm<EmailChangeValues>({
        resolver: zodResolver(emailChangeSchema),
        defaultValues: { newEmail: '' },
    });

    const otpForm = useForm<EmailOtpValues>({
        resolver: zodResolver(emailOtpSchema),
        defaultValues: { otp: '' },
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

    const onRequestChange = async (data: EmailChangeValues) => {
        setIsLoading(true);
        try {
            await authApi.requestEmailChange(data.newEmail);
            setNewEmail(data.newEmail);
            setStep('otp');
            setCountdown(60);
            setOtpExpiresIn(600);
            toast({
                title: 'Verification Code Sent',
                description: `A code has been sent to ${data.newEmail}`,
            });
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Error',
                description: err.message || 'Failed to request email change.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onVerifyOtp = async (data: EmailOtpValues) => {
        setIsLoading(true);
        try {
            await authApi.verifyEmailChange({ newEmail, otp: data.otp });
            setStep('success');
            toast({
                title: 'Email Updated',
                description: `Your email has been changed to ${newEmail}`,
            });
            // Reset after delay
            setTimeout(() => {
                setStep('email');
                emailForm.reset();
                otpForm.reset();
            }, 3000);
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Verification Failed',
                description: err.message || 'Invalid or expired code.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setIsLoading(true);
        try {
            await authApi.requestEmailChange(newEmail);
            setCountdown(60);
            setOtpExpiresIn(600);
            otpForm.reset();
            toast({ title: 'Code Resent', description: 'A new code has been sent.' });
        } catch (error: unknown) {
            const err = error as Error;
            toast({ title: 'Failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="border-border/60 shadow-lg shadow-black/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                        <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle>Change Email</CardTitle>
                        <CardDescription>
                            Update your email address. Requires OTP verification.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {step === 'email' && (
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onRequestChange)} className="space-y-5">
                            <FormField
                                control={emailForm.control}
                                name="newEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="newemail@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                    ) : (
                                        'Send Verification Code'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === 'otp' && (
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-5">
                            <p className="text-sm text-muted-foreground">
                                Enter the verification code sent to{' '}
                                <span className="font-medium text-primary">{newEmail}</span>
                            </p>

                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <FormControl>
                                            <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                                                    <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                                                    <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                                                    <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                                                    <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                                                    <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {otpExpiresIn > 0 && (
                                <p className="text-center text-sm text-muted-foreground">
                                    Code expires in{' '}
                                    <span className="font-medium text-primary">
                                        {formatTime(otpExpiresIn)}
                                    </span>
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || isLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                        {countdown > 0 ? `${countdown}s` : 'Resend'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setStep('email'); otpForm.reset(); }}
                                    >
                                        Change email
                                    </Button>
                                </div>
                                <Button type="submit" disabled={isLoading || otpForm.watch('otp').length !== 6}>
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                                    ) : (
                                        'Verify & Update'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="text-sm font-medium text-green-600">Email updated to {newEmail}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
