/**
 * LinkBeet API Client for Next.js
 * Server-side and client-side API configuration for NestJS backend integration
 */

// API Base URL - sourced exclusively from environment variables.
// NEVER hardcode production URLs in source code.
// Set NEXT_PUBLIC_API_URL in .env.local (dev) or platform secrets (prod).
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Types for API responses
export interface User {
  id: string;
  email?: string;
  role: "business" | "user";
  name?: string;
  isVerified: boolean;
  businessId?: string;
}

export interface Business {
  id: string;
  businessName: string;
  ownerId: string;
  location?: string;
  category?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor: string;
  wifiSsid?: string;
  googleReviewUrl?: string;
  websiteUrl?: string;
  welcomeTitle?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  showWelcomeBanner?: boolean;
  operatingHours?: Record<string, string>;
  profileType: "private" | "public";
  onboardingCompleted: boolean;
  isActive: boolean;
  status?: "pending_approval" | "active" | "suspended" | "rejected";
  rejectionReason?: string;
  suspensionReason?: string;
  ads: Ad[];

  // Tree Profile Specific Fields
  theme?: {
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor: string;
    backgroundType: string;
    backgroundValue: string;
    textColor: string;
    fontFamily: string;
    buttonStyle: string;
    cardStyle: string;
  };
  customLinks?: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
    icon?: string;
    style: string;
    isActive: boolean;
  }>;
  socialLinks?: Array<{
    id: string;
    platform: string;
    url: string;
    label?: string;
  }>;
  sectionTitle?: string;
  linksTitle?: string;
  tagline?: string;

  // Tree Profile Data arrays
  banners?: Array<{
    id: string;
    imageUrl: string;
    title?: string;
    linkUrl?: string;
    isActive: boolean;
    s3Key?: string;
  }>;
  gallery?: Array<{
    id: string;
    imageUrl: string;
    caption?: string;
    s3Key?: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    emoji?: string;
  }>;
  catalogItems?: Array<{
    id: string;
    categoryId: string;
    title: string;
    description?: string;
    price?: number;
    currency: string;
    imageUrl?: string;
    tags?: string[];
    isAvailable: boolean;
    s3Key?: string;
  }>;
  reviews?: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    date: string;
    avatarUrl?: string;
  }>;
  profileImage?: string;
  bannerImage?: string;
  openingHours?: { start: string; end: string };

  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalConnections: number;
  activeUsers: number;
  totalAdsServed: number;
  totalViews: number;
  totalClicks: number;
  ctr: number;
  revenue: number;
  connectionsHistory: Array<{
    date: string;
    count: number;
  }>;
}

export interface Ad {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  ctaUrl?: string;
  title: string;
  description?: string;
  duration: number;
  status: "active" | "paused" | "archived";
  views: number;
  clicks: number;
  likesCount?: number;
  sharesCount?: number;
  placement?: string;
  s3Key?: string;
  createdAt?: string;
}

export interface SplashData {
  business: {
    id: string;
    name: string;
    businessName?: string;
    location?: string;
    logoUrl?: string;
    primaryColor?: string;
    googleReviewUrl?: string;
    contactPhone?: string;
    welcomeTitle?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    showWelcomeBanner?: boolean;
    description?: string;
  };
  ads: Array<{
    id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    ctaUrl?: string;
    duration: number;
    status?: string;
    placement?: string;
    likesCount?: number;
    sharesCount?: number;
  }>;
}

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

// ===== SERVER-SIDE FETCH FUNCTIONS (For SSR) =====

/**
 * Fetch splash page data - Server-side only
 * Used in page.tsx for SSR
 */
export async function fetchSplashData(businessId: string): Promise<SplashData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/splash/${businessId}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ApiError(response.status, 'Failed to fetch splash data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching splash data:', error);
    return null;
  }
}

/**
 * Fetch business data by ID - Server-side
 */
export async function fetchBusinessById(id: string): Promise<Business | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/business/${id}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ApiError(response.status, 'Failed to fetch business');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

/**
 * Fetch business data by username - Server-side (public profile)
 */
export async function fetchBusinessByUsername(username: string): Promise<Business | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/business/u/${username}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ApiError(response.status, 'Failed to fetch business');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching business by username:', error);
    return null;
  }
}

// ===== CLIENT-SIDE API FUNCTIONS =====

// Token storage key (client-side only)
const TOKEN_KEY = "mm_token"; // Aligned with middleware
const USER_KEY = "mm_user";

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

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    removeCookie(TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Also sync businessId to cookie for middleware redirects
    if (user.businessId) {
      setCookie("mm_business_id", user.businessId);
    } else {
      removeCookie("mm_business_id");
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// HTTP client with auth headers (Client-side)
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = tokenStorage.getToken();

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

  // Handle 401 - clear token and redirect
  if (response.status === 401) {
    tokenStorage.removeToken();
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const noRedirectPaths = ["/login", "/signup", "/splash"];
      const shouldRedirect = !noRedirectPaths.some(p => path.includes(p));

      if (shouldRedirect) {
        window.location.href = "/login";
      }
    }
  }

  return response;
}

// Generic API request helper (Client-side)
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

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

// ===== SPLASH API (Client-side mutations) =====
export const splashApi = {
  // Authenticate with Google OAuth
  async googleAuth(
    businessId: string,
    credential: string,
    sessionId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    email?: string;
    name?: string;
    picture?: string;
    isNewUser?: boolean;
    redirectUrl?: string;
  }> {
    return apiRequest(`/splash/${businessId}/auth/google`, {
      method: "POST",
      body: JSON.stringify({ credential, sessionId }),
    });
  },

  // Request OTP for WiFi access
  async requestOtp(
    businessId: string,
    email: string,
  ): Promise<{
    success: boolean;
    message: string;
    expiresIn?: number;
    cooldown?: number;
  }> {
    return apiRequest(`/splash/${businessId}/request-otp`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Verify OTP
  async verifyOtp(
    businessId: string,
    email: string,
    otp: string,
    sessionId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  }> {
    return apiRequest(`/splash/${businessId}/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ email, otp, sessionId }),
    });
  },

  // Check if email is already verified
  async checkVerification(
    businessId: string,
    email: string,
  ): Promise<{
    isVerified: boolean;
    visitCount: number;
    authMethod?: string;
  }> {
    return apiRequest(`/splash/${businessId}/check/${encodeURIComponent(email)}`);
  },
};

// ===== BUSINESS API (Client-side mutations) =====
export const businessApi = {
  // Get business by ID
  async getById(id: string): Promise<Business> {
    return apiRequest(`/business/${id}`);
  },

  // Get current user's business
  async getMyBusiness(): Promise<Business | null> {
    try {
      const response = await apiRequest<Business | { business: null }>("/business/me");
      // Handle case where backend returns { business: null }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (response && 'business' in response && (response as any).business === null) {
        return null;
      }
      return response as Business;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get dashboard stats
  async getDashboardStats(businessId: string): Promise<DashboardStats> {
    return apiRequest(`/business/${businessId}/stats`);
  },

  // Update business profile
  async update(id: string, data: Partial<Business>): Promise<Business> {
    return apiRequest(`/business/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getSplashData(id: string): Promise<{
    business: Business;
    ads: Array<{
      id: string;
      title: string;
      mediaUrl: string;
      mediaType: "image" | "video";
      ctaUrl?: string;
      duration: number;
    }>;
  }> {
    // Use /splash endpoint which is handled by SplashController
    return apiRequest(`/splash/${id}`);
  },

  // Register new business
  async register(data: {
    businessName: string;
    username?: string;
    location?: string;
    category?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<Business> {
    return apiRequest('/business/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get public profile by username
  async getPublicProfile(username: string): Promise<Business> {
    return apiRequest(`/business/u/${username}`);
  },

  // Check username availability
  async checkUsername(username: string): Promise<{ available: boolean }> {
    return apiRequest(`/business/check-username/${username}`);
  },

  // Upload media
  async uploadMedia(
    businessId: string,
    file: File,
    placement: 'branding' | 'banner' | 'gallery' | 'tree-profile-banners' | 'tree-profile-gallery' | 'tree-profile-catalog' | 'tree-profile-profile'
  ): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('placement', placement);

    return apiRequest(`/business/${businessId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },
};

// ===== ANALYTICS API (Client-side) =====
export const analyticsApi = {
  async trackInteraction(data: {
    adId: string;
    businessId: string;
    interactionType: "view" | "click" | "LIKE" | "SHARE" | "GALLERY_EXPAND";
    userId?: string;
    macAddress?: string;
    deviceType?: string;
    sessionId?: string;
    email?: string;
  }): Promise<{ success: boolean; redirectUrl?: string }> {
    return apiRequest("/analytics/track", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async connectWifi(data: {
    businessId: string;
    macAddress?: string;
    deviceType?: string;
    email?: string;
  }): Promise<{ success: boolean; redirectUrl: string }> {
    return apiRequest("/analytics/connect", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getSummary(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
    uniqueUsers: number;
    startDate: string;
    endDate: string;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/analytics/summary/${businessId}${query}`);
  },

  async getDailyAnalytics(
    businessId: string,
    days?: number,
  ): Promise<
    Array<{
      date: string;
      views: number;
      clicks: number;
    }>
  > {
    const query = days ? `?days=${days}` : "";
    return apiRequest(`/analytics/daily/${businessId}${query}`);
  },
};

// ===== AUTH API =====
export interface AuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  role: "business" | "user";
  businessId?: string;
}

export const authApi = {
  async signup(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyOtp(
    email: string,
    otp: string,
    macAddress?: string,
  ): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, macAddress }),
    });

    // Store token
    tokenStorage.setToken(response.accessToken);

    // Construct user object from flat response
    const user: User = {
      id: response.userId,
      email: response.email,
      role: response.role,
      isVerified: true,
      businessId: response.businessId
    };

    tokenStorage.setUser(user);

    return response;
  },

  async getMe(): Promise<User> {
    return apiRequest("/auth/me");
  },

  logout(): void {
    tokenStorage.removeToken();
  },
};

// ===== ADS API =====
export const adsApi = {
  async getByBusiness(businessId: string): Promise<Ad[]> {
    return apiRequest(`/ads/business/${businessId}`);
  },

  async create(
    businessId: string,
    data: {
      title: string;
      mediaUrl: string;
      mediaType: "image" | "video";
      ctaUrl?: string;
      description?: string;
      duration?: number;
      placement?: string;
    },
  ): Promise<Ad> {
    return apiRequest(`/ads/business/${businessId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    businessId: string,
    adId: string,
    data: Partial<Ad>,
  ): Promise<Ad> {
    return apiRequest(`/ads/business/${businessId}/${adId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(businessId: string, adId: string): Promise<void> {
    return apiRequest(`/ads/business/${businessId}/${adId}`, {
      method: "DELETE",
    });
  },

  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest("/ads/upload", {
      method: "POST",
      body: formData,
    });
  },
};


