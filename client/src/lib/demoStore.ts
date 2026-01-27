import type {
  Business,
  Campaign,
  CreateCampaignRequest,
  UpdateBusinessRequest,
  UpdateCampaignRequest,
} from "@shared/schema";

type StoredBusiness = Omit<Business, "createdAt"> & { createdAt: string | null };
type StoredCampaign = Omit<Campaign, "createdAt"> & { createdAt: string | null };

type StoredData = {
  businesses: StoredBusiness[];
  campaigns: StoredCampaign[];
};

const STORAGE_KEY = "mm_demo_data_v1";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

function asDate(v: string | null | undefined) {
  return v ? new Date(v) : null;
}

function normalizeBusiness(b: StoredBusiness): Business {
  return {
    ...b,
    createdAt: asDate(b.createdAt),
  } as any;
}

function normalizeCampaign(c: StoredCampaign): Campaign {
  return {
    ...c,
    createdAt: asDate(c.createdAt),
  } as any;
}

function seed(): StoredData {
  const now = new Date();
  const business1: StoredBusiness = {
    id: 1,
    ownerId: 1,
    name: "The Daily Grind Cafe",
    category: "Coffee shops",
    address: "123 Espresso Lane",
    contactEmail: null,
    contactPhone: null,
    description: null,
    operatingHours: null,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DG",
    primaryColor: "#0ea5e9",
    wifiSsid: "DailyGrind_Guest",
    wifiSessionDurationMinutes: null,
    bandwidthKbps: null,
    maxConcurrentConnections: null,
    autoReconnect: true,
    profileType: "public",
    photos: null,
    banners: null,
    videoUrl: null,
    onboardingCompleted: true,
    isActive: true,
    createdAt: toIso(now),
  };

  const campaigns: StoredCampaign[] = [
    {
      id: 1,
      businessId: 1,
      title: "Morning Pastry Deal",
      type: "banner",
      contentUrl:
        "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=1200",
      duration: 5,
      isActive: true,
      startDate: null,
      endDate: null,
      targetBusinessIds: null,
      views: 0,
      clicks: 0,
      createdAt: toIso(now),
    },
    {
      id: 2,
      businessId: 1,
      title: "Lunch Special",
      type: "banner",
      contentUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200",
      duration: 5,
      isActive: true,
      startDate: null,
      endDate: null,
      targetBusinessIds: null,
      views: 0,
      clicks: 0,
      createdAt: toIso(now),
    },
    {
      id: 3,
      businessId: null,
      title: "Platform Promo",
      type: "banner",
      contentUrl:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1200",
      duration: 5,
      isActive: true,
      startDate: null,
      endDate: null,
      targetBusinessIds: [1],
      views: 0,
      clicks: 0,
      createdAt: toIso(now),
    },
  ];

  return { businesses: [business1], campaigns };
}

function load(): StoredData {
  if (typeof window === "undefined") return seed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const s = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }

  try {
    const parsed = JSON.parse(raw) as StoredData;
    if (!parsed?.businesses || !parsed?.campaigns) throw new Error("bad");
    return parsed;
  } catch {
    const s = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
}

function save(data: StoredData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nextCampaignId(data: StoredData) {
  const max = data.campaigns.reduce((m, c) => Math.max(m, c.id), 0);
  return max + 1;
}

export const demoStore = {
  getBusiness(id: number): Business | null {
    const data = load();
    const b = data.businesses.find((x) => x.id === id);
    return b ? normalizeBusiness(b) : null;
  },

  listBusinesses(): (Business & { connectionCount: number; emailCount: number })[] {
    const data = load();
    return data.businesses.map((b) => ({
      ...(normalizeBusiness(b) as any),
      connectionCount: 0,
      emailCount: 0,
    }));
  },

  updateBusiness(id: number, updates: UpdateBusinessRequest): Business {
    const data = load();
    const idx = data.businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Business not found");

    const existing = data.businesses[idx];
    const updated: StoredBusiness = {
      ...existing,
      ...updates,
      createdAt: existing.createdAt,
    } as any;

    data.businesses[idx] = updated;
    save(data);
    return normalizeBusiness(updated);
  },

  listCampaignsByBusiness(businessId: number): Campaign[] {
    const data = load();
    return data.campaigns
      .filter((c) => c.businessId === businessId)
      .map(normalizeCampaign)
      .sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
  },

  listAllCampaigns(): Campaign[] {
    const data = load();
    return data.campaigns
      .map(normalizeCampaign)
      .sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
  },

  createCampaign(req: CreateCampaignRequest): Campaign {
    const data = load();
    const now = new Date();
    const newC: StoredCampaign = {
      id: nextCampaignId(data),
      businessId: req.businessId ?? null,
      title: req.title,
      type: req.type,
      contentUrl: req.contentUrl,
      duration: req.duration ?? 5,
      isActive: req.isActive ?? true,
      startDate: req.startDate || null,
      endDate: req.endDate || null,
      targetBusinessIds: (req as any).targetBusinessIds || null,
      views: 0,
      clicks: 0,
      createdAt: toIso(now),
    };

    data.campaigns.unshift(newC);
    save(data);
    return normalizeCampaign(newC);
  },

  updateCampaign(id: number, updates: UpdateCampaignRequest): Campaign {
    const data = load();
    const idx = data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Campaign not found");

    const existing = data.campaigns[idx];
    const updated: StoredCampaign = {
      ...existing,
      ...updates,
      createdAt: existing.createdAt,
    } as any;

    data.campaigns[idx] = updated;
    save(data);
    return normalizeCampaign(updated);
  },

  deleteCampaign(id: number): void {
    const data = load();
    data.campaigns = data.campaigns.filter((c) => c.id !== id);
    save(data);
  },

  splashGet(businessId: number): { business: Business; campaigns: Campaign[] } {
    const data = load();
    const business = data.businesses.find((b) => b.id === businessId);
    if (!business) throw new Error("Business not found");

    const localCampaigns = data.campaigns
      .filter((c) => c.businessId === businessId)
      .map(normalizeCampaign);

    if ((business.profileType as any) === "public") {
      const globalCampaigns = data.campaigns
        .filter((c) => {
          if (c.businessId) return false;
          if (!c.targetBusinessIds || c.targetBusinessIds.length === 0)
            return true;
          return c.targetBusinessIds.includes(businessId);
        })
        .map(normalizeCampaign);

      const campaigns = [...localCampaigns, ...globalCampaigns].sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );

      return { business: normalizeBusiness(business), campaigns };
    }

    return { business: normalizeBusiness(business), campaigns: localCampaigns };
  },

  adminStats(): {
    totalBusinesses: number;
    totalConnections: number;
    totalActiveCampaigns: number;
    totalEmailsCollected: number;
  } {
    const data = load();
    return {
      totalBusinesses: data.businesses.length,
      totalConnections: 0,
      totalActiveCampaigns: data.campaigns.filter((c) => c.isActive).length,
      totalEmailsCollected: 0,
    };
  },
};
