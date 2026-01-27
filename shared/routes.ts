import { z } from 'zod';
import { 
  insertUserSchema, 
  insertBusinessSchema, 
  insertCampaignSchema, 
  users, 
  businesses, 
  campaigns, 
  sessions 
} from './schema';

// === ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  // Auth (Mock)
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string() }),
      responses: {
        200: z.object({ 
          id: z.number(), 
          username: z.string(), 
          role: z.enum(["admin", "business", "user"]),
          businessId: z.number().optional() 
        }),
        401: errorSchemas.notFound,
      },
    },
  },

  // Businesses
  businesses: {
    get: {
      method: 'GET' as const,
      path: '/api/businesses/:id',
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/businesses/:id',
      input: insertBusinessSchema.partial(),
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    dashboardStats: {
      method: 'GET' as const,
      path: '/api/businesses/:id/stats',
      responses: {
        200: z.object({
          totalConnections: z.number(),
          activeUsers: z.number(),
          totalAdsServed: z.number(),
          revenue: z.number(),
          connectionsHistory: z.array(z.object({ date: z.string(), count: z.number() })),
        }),
      },
    },
  },

  // Campaigns (Ads)
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/businesses/:businessId/campaigns',
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns',
      input: insertCampaignSchema,
      responses: {
        201: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/campaigns/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Public Splash Page Data
  splash: {
    get: {
      method: 'GET' as const,
      path: '/api/splash/:businessId',
      responses: {
        200: z.object({
          business: z.custom<typeof businesses.$inferSelect>(),
          campaigns: z.array(z.custom<typeof campaigns.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
    connect: {
      method: 'POST' as const,
      path: '/api/splash/:businessId/connect',
      input: z.object({ userId: z.number().optional(), deviceType: z.string().optional() }),
      responses: {
        200: z.object({ success: z.boolean(), redirectUrl: z.string() }),
      },
    },
  },
};

// === BUILD URL HELPER ===
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
