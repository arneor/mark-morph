import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, adminTokenStorage } from '@/lib/api';

interface AdminUser {
    adminId: string;
    email: string;
    role: string;
}

export function useAdminAuth(requireAuth = true) {
    const router = useRouter();
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = adminApi.isAuthenticated();
            const currentAdmin = adminTokenStorage.getAdmin();

            setIsAuthenticated(isAuth);
            setAdmin(currentAdmin);
            setIsLoading(false);

            if (requireAuth && !isAuth) {
                router.push('/login');
            }
        };

        checkAuth();

        // Listen for storage events (logout in another tab)
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router, requireAuth]);

    return {
        admin,
        isAuthenticated,
        isLoading,
        logout: () => {
            adminApi.logout();
            router.push('/login');
        }
    };
}
