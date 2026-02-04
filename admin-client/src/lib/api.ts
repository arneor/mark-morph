/**
 * Admin API Client for MarkMorph Admin Dashboard
 * Separate from customer API for security isolation
 */

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? "http://localhost:3001/api" : "https://mark-morph.onrender.com/api");

// API error class
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// ===== ADMIN TOKEN STORAGE =====
const ADMIN_TOKEN_KEY = "mm_admin_token";
const ADMIN_USER_KEY = "mm_admin_user";

// Cookie helpers
function setCookie(name: string, value: string, days = 7) {
    if (typeof window === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

export const adminTokenStorage = {
    getToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    },

    setToken(token: string): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        setCookie(ADMIN_TOKEN_KEY, token);
    },

    removeToken(): void {
        if (typeof window === "undefined") return;
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        removeCookie(ADMIN_TOKEN_KEY);
    },

    getAdmin(): { adminId: string; email: string; role: string } | null {
        if (typeof window === "undefined") return null;
        const admin = localStorage.getItem(ADMIN_USER_KEY);
        return admin ? JSON.parse(admin) : null;
    },

    setAdmin(admin: { adminId: string; email: string; role: string }): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};

// Admin API request helper (uses admin token)
async function adminApiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = adminTokenStorage.getToken();

    const headers = new Headers(options.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle 401 - clear admin token and redirect to admin login
    if (response.status === 401) {
        adminTokenStorage.removeToken();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text();
        throw new ApiError(
            response.status,
            errorData.message || errorData || "Request failed",
            errorData,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (isJson ? response.json() : response.text()) as Promise<T>;
}

// Generic API request helper (no auth)
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text();
        throw new ApiError(
            response.status,
            errorData.message || errorData || "Request failed",
            errorData,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (isJson ? response.json() : response.text()) as Promise<T>;
}

// ===== ADMIN TYPES =====
export interface AdminStats {
    totalBusinesses: number;
    totalConnections: number;
    totalActiveCampaigns: number;
    totalEmailsCollected: number;
    growthRate?: number;
    pendingApprovalCount?: number;
}

export interface AdminBusinessListItem {
    id: string;
    businessName: string;
    ownerPhone?: string;
    ownerEmail?: string;
    location?: string;
    category?: string;
    adsCount: number;
    connectionCount: number;
    isActive: boolean;
    status: "pending_approval" | "active" | "suspended" | "rejected";
    rejectionReason?: string;
    suspensionReason?: string;
    createdAt: string;
}

export interface AdminBusinessDetails extends AdminBusinessListItem {
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    logoUrl?: string;
    updatedAt?: string;
    activatedAt?: string;

    // Aggregated Metrics
    totalAdViews: number;
    totalAdClicks: number;
    totalAdLikes: number;
    totalAdShares: number;
    totalAdExpands: number;
    avgCtr: number;

    // Detailed Post List
    topPosts: Array<{
        id: string;
        title: string;
        mediaUrl: string;
        status: string;
        views: number;
        clicks: number;
        likes: number;
        shares: number;
        expands: number;
        performanceScore: number;
        placement?: string;
    }>;
}

export interface AdminAnalyticsData {
    kpis: {
        totalUsers: number;
        userGrowth: string;
        activeBusinesses: number;
        totalBusinesses: number;
        totalAdViews: number;
        totalClicks: number;
        ctr: string;
        googleReviewsTriggered: number;
    };
    heatMap: Array<{
        hour: number;
        count: number;
    }>;
    businesses: Array<{
        id: string;
        name: string;
        location: string;
        totalConnections: number;
        activeSessions: number;
        loyaltyRate: string;
        stats: {
            views: number;
            clicks: number;
            reviewsTriggered: number;
        };
    }>;
}

export interface AdminTrendData {
    date: string;
    views: number;
    connections: number;
}

// ===== ADMIN API =====
export const adminApi = {
    // Request OTP for admin login
    async requestOtp(email: string): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
        cooldown?: number;
    }> {
        return apiRequest("/admin/request-otp", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    // Verify OTP and login
    async verifyOtp(
        email: string,
        otp: string,
    ): Promise<{
        accessToken: string;
        adminId: string;
        email: string;
        role: string;
        expiresIn: number;
    }> {
        const response = await apiRequest<{
            accessToken: string;
            adminId: string;
            email: string;
            role: string;
            expiresIn: number;
        }>("/admin/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
        });

        adminTokenStorage.setToken(response.accessToken);
        adminTokenStorage.setAdmin({
            adminId: response.adminId,
            email: response.email,
            role: response.role,
        });

        return response;
    },

    // Admin logout
    logout(): void {
        adminTokenStorage.removeToken();
    },

    // Check if admin is authenticated
    isAuthenticated(): boolean {
        return adminTokenStorage.isAuthenticated();
    },

    // Get current admin info
    async getMe(): Promise<{
        adminId: string;
        email: string;
        role: string;
    }> {
        return adminApiRequest("/admin/me");
    },

    // Get platform stats
    async getStats(): Promise<AdminStats> {
        return adminApiRequest("/admin/stats");
    },

    // Get all businesses
    async getBusinesses(): Promise<AdminBusinessListItem[]> {
        return adminApiRequest("/admin/businesses");
    },

    // Get pending approval businesses
    async getPendingBusinesses(): Promise<AdminBusinessListItem[]> {
        return adminApiRequest("/admin/businesses/pending");
    },

    // Activate a business
    async activateBusiness(
        businessId: string,
    ): Promise<AdminBusinessListItem> {
        return adminApiRequest(`/admin/businesses/${businessId}/activate`, {
            method: "PUT",
        });
    },

    // Reject a business
    async rejectBusiness(
        businessId: string,
        reason?: string,
    ): Promise<AdminBusinessListItem> {
        return adminApiRequest(`/admin/businesses/${businessId}/reject`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        });
    },

    // Suspend a business
    async suspendBusiness(
        businessId: string,
        reason?: string,
    ): Promise<AdminBusinessListItem> {
        return adminApiRequest(`/admin/businesses/${businessId}/suspend`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        });
    },

    // Get connection count
    async getConnectionCount(): Promise<{ totalConnections: number }> {
        return adminApiRequest("/admin/connections/count");
    },

    // Get access logs for a business
    async getBusinessAccessLogs(
        businessId: string,
    ): Promise<
        Array<{
            id: string;
            adminEmail: string;
            action: string;
            timestamp: string;
            details?: Record<string, unknown>;
        }>
    > {
        return adminApiRequest(`/admin/businesses/${businessId}/access-logs`);
    },

    // Get detailed business insights
    async getBusinessDetails(businessId: string): Promise<AdminBusinessDetails> {
        return adminApiRequest(`/admin/businesses/${businessId}/details`);
    },

    // Get full dashboard analytics
    async getDashboardAnalytics(): Promise<AdminAnalyticsData> {
        return adminApiRequest("/admin/analytics/dashboard");
    },

    // Get trend analytics
    async getTrendAnalytics(): Promise<AdminTrendData[]> {
        return adminApiRequest("/admin/analytics/trends");
    },

    // Get granular interaction details for a specific ad
    async getAdInteractionDetails(adId: string): Promise<unknown[]> {
        return adminApiRequest(`/admin/ads/${adId}/interactions`);
    },
};
