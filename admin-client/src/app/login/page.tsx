'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    ArrowRight,
    Loader2,
    Shield,
    ArrowLeft,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';

type LoginStep = 'email' | 'otp';

export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Step state
    const [step, setStep] = useState<LoginStep>('email');

    // Form state
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Refs for OTP inputs
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Check if already logged in
    useEffect(() => {
        if (adminApi.isAuthenticated()) {
            router.push('/dashboard');
        }
    }, [router]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle email submission
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isLoading) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await adminApi.requestOtp(email);

            if (response.success) {
                setStep('otp');
                setResendCooldown(60);
                toast({
                    title: 'Code Sent!',
                    description: 'Check your email for the verification code.',
                });
                setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
            } else if (response.cooldown) {
                setResendCooldown(response.cooldown);
                setError(`Please wait ${response.cooldown} seconds before trying again`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Failed to send verification code');
            toast({
                title: 'Error',
                description: error.message || 'Failed to send code',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError(null);

        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
            handleOtpSubmit(newOtp.join(''));
        }
    };

    // Handle OTP backspace
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            otpInputRefs.current[5]?.focus();
            handleOtpSubmit(pastedData);
        }
    };

    // Handle OTP verification
    const handleOtpSubmit = async (otpValue?: string) => {
        const code = otpValue || otp.join('');
        if (code.length !== 6 || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminApi.verifyOtp(email, code);

            toast({
                title: 'Welcome, Admin!',
                description: 'Login successful. Redirecting...',
            });

            setTimeout(() => router.push('/dashboard'), 500);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Invalid verification code');
            setOtp(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
            toast({
                title: 'Verification Failed',
                description: error.message || 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend OTP
    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await adminApi.requestOtp(email);

            if (response.success) {
                setResendCooldown(60);
                setOtp(['', '', '', '', '', '']);
                otpInputRefs.current[0]?.focus();
                toast({
                    title: 'Code Sent!',
                    description: 'A new code has been sent to your email.',
                });
            } else if (response.cooldown) {
                setResendCooldown(response.cooldown);
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle back to email
    const handleBackToEmail = () => {
        setStep('email');
        setOtp(['', '', '', '', '', '']);
        setError(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0a1a] via-[#111827] to-[#0a0a1a] p-4">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-r from-[#9EE53B]/5 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-l from-[#43E660]/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
                    <CardContent className="p-8">
                        {/* Logo & Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#9EE53B] to-[#43E660] mb-4 shadow-lg shadow-[#9EE53B]/30">
                                <Shield className="w-8 h-8 text-[#0a0a1a]" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                            <p className="text-white/60 text-sm">
                                {step === 'email'
                                    ? 'Enter your email to login'
                                    : 'Enter the verification code'}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {/* Email Step */}
                            {step === 'email' && (
                                <motion.form
                                    key="email-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleEmailSubmit}
                                    className="space-y-6"
                                >
                                    {/* Error message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Email input */}
                                    <div className="space-y-2">
                                        <label className="text-white/70 text-sm font-medium">
                                            Admin Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <Input
                                                type="email"
                                                placeholder="admin@example.com"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setError(null);
                                                }}
                                                className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#9EE53B] focus:ring-[#9EE53B]/30 text-lg"
                                                disabled={isLoading}
                                                autoFocus
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <Button
                                        type="submit"
                                        disabled={!email || isLoading}
                                        className="w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 bg-[#9EE53B] hover:bg-[#8CD032]"
                                    >
                                        <span className="flex items-center justify-center gap-2 text-[#0a0a1a]">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Verification Code
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </span>
                                    </Button>

                                    {/* Security note */}
                                    <p className="text-center text-white/40 text-xs">
                                        Only authorized admin emails can access this portal
                                    </p>
                                </motion.form>
                            )}

                            {/* OTP Step */}
                            {step === 'otp' && (
                                <motion.div
                                    key="otp-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Back button */}
                                    <button
                                        type="button"
                                        onClick={handleBackToEmail}
                                        className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Change email
                                    </button>

                                    {/* Email display */}
                                    <div className="text-center">
                                        <p className="text-white/60 text-sm mb-1">Code sent to</p>
                                        <p className="text-[#9EE53B] font-medium">{email}</p>
                                    </div>

                                    {/* Error message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* OTP inputs */}
                                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                ref={(el) => { otpInputRefs.current[index] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 text-center text-xl font-bold bg-white/5 border-white/10 text-white rounded-xl focus:border-[#9EE53B] focus:ring-[#9EE53B]/30"
                                                disabled={isLoading}
                                            />
                                        ))}
                                    </div>

                                    {/* Verify button */}
                                    <Button
                                        type="button"
                                        onClick={() => handleOtpSubmit()}
                                        disabled={otp.join('').length !== 6 || isLoading}
                                        className="w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 bg-[#9EE53B] hover:bg-[#8CD032]"
                                    >
                                        <span className="flex items-center justify-center gap-2 text-[#0a0a1a]">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Verify & Login
                                                </>
                                            )}
                                        </span>
                                    </Button>

                                    {/* Resend link */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={resendCooldown > 0 || isLoading}
                                            className={`inline-flex items-center gap-2 text-sm transition-colors ${resendCooldown > 0
                                                ? 'text-white/40 cursor-not-allowed'
                                                : 'text-[#9EE53B] hover:text-[#B5F84F]'
                                                }`}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            {resendCooldown > 0
                                                ? `Resend in ${resendCooldown}s`
                                                : 'Resend code'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-white/30 text-xs">
                        Secure Admin Access • Linkbeet Platform
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
