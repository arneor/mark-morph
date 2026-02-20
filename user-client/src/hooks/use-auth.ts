'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, tokenStorage, type AuthResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for requesting OTP (login flow step 1)
 */
export function useRequestOtp() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password?: string }) => {
      return authApi.login({ email, password: password || '' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    },
  });
}

/**
 * Hook for verifying OTP (login flow step 2)
 */
export function useVerifyOtp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return authApi.verifyOtp(email, otp);
    },
    onSuccess: (data: AuthResponse) => {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully verified your account.',
      });
      // Invalidate user query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Redirect to dashboard if user has a business
      if (data.businessId) {
        router.push(`/dashboard/${data.businessId}`);
      } else {
        router.push('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for user signup
 */
export function useSignup() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return authApi.signup({ email, password });
    },
    onSuccess: () => {
      toast({
        title: 'Account Created',
        description: 'Please check your email for the verification code.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for initiating password recovery
 */
export function useForgotPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      return authApi.forgotPassword(email);
    },
    onSuccess: () => {
      toast({
        title: 'Reset Code Sent',
        description: 'Check your email for the password recovery code.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to send recovery code',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for resetting password verify OTP
 */
export function useResetPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { email: string; otp: string; newPassword: string }) => {
      return authApi.resetPassword(data);
    },
    onSuccess: (data) => {
      tokenStorage.setToken(data.accessToken);
      queryClient.setQueryData(['user'], data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Invalid or expired code',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to log out
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return () => {
    authApi.logout();
    queryClient.setQueryData(['user'], null);
    queryClient.clear(); // Clear all cache
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };
}

/**
 * Combined auth hook for convenience
 */
export function useAuth() {
  const { data: user, isLoading } = useUser();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const signup = useSignup();
  const logout = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!tokenStorage.getToken(),
    requestOtp,
    verifyOtp,
    signup,
    logout,
    forgotPassword: useForgotPassword(),
    resetPassword: useResetPassword(),
  };
}
