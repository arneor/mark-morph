import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users (Admins, Business Owners, End Users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "business", "user"] }).default("user").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business Profiles
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // Links to users.id
  name: text("name").notNull(),
  address: text("address"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#000000"),
  wifiSsid: text("wifi_ssid"),
  profileType: text("profile_type", { enum: ["private", "public"] }).default("private"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ad Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"), // Nullable if system-wide ad
  title: text("title").notNull(),
  type: text("type", { enum: ["banner", "video", "static"] }).notNull(),
  contentUrl: text("content_url").notNull(),
  duration: integer("duration").default(5), // Seconds for carousel/video
  isActive: boolean("is_active").default(true),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// WiFi Sessions (Analytics)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id"), // Optional if anonymous
  durationMinutes: integer("duration_minutes"),
  deviceType: text("device_type"),
  connectedAt: timestamp("connected_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, views: true, clicks: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, connectedAt: true });

// === EXPLICIT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Request/Response Types
export type LoginRequest = { username: string; }; // Simple mock login
export type AuthResponse = User & { business?: Business };

export type CreateBusinessRequest = InsertBusiness;
export type UpdateBusinessRequest = Partial<InsertBusiness>;

export type CreateCampaignRequest = InsertCampaign;
export type UpdateCampaignRequest = Partial<InsertCampaign>;

export type DashboardStats = {
  totalConnections: number;
  activeUsers: number;
  totalAdsServed: number;
  revenue: number; // Mocked
};
