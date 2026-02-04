export interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'superadmin';
    createdAt: string;
}

export interface Business {
    id: string;
    businessName: string;
    ownerEmail?: string;
    ownerPhone?: string;
    location?: string;
    category?: string;
    status: 'pending_approval' | 'active' | 'suspended' | 'rejected';
    plan?: string;
    createdAt: string;
    lastActive?: string;
}

export interface DashboardStats {
    totalBusinesses: number;
    activeBusinesses: number;
    totalUsers: number;
    totalCampaigns: number;
    totalImpressions: number;
    totalClicks: number;
    pendingApprovalCount: number;
}

export interface AnalyticsTrend {
    date: string;
    views: number;
    connections: number;
}

export interface HeatMapData {
    hour: number;
    count: number;
}
