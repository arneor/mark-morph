import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // === API ROUTES ===

  // Login (Mock)
  app.post(api.auth.login.path, async (req, res) => {
    const { email } = req.body;
    // Simple mock login logic - map email to username for now since we store email as username in signup
    let user = await storage.getUserByUsername(email);

    if (!user) {
      if (email === "admin@example.com") {
        user = await storage.createUser({
          username: email,
          password: "password",
          role: "admin",
          name: "Admin User",
          email: email
        });
      } else if (email === "owner@example.com") {
        // Create mock business owner
        user = await storage.createUser({
          username: email,
          password: "password",
          role: "business",
          name: "Joe Coffee",
          email: email
        });
        // Ensure business profile exists
        const existingBiz = await storage.getBusinessByOwnerId(user.id);
        if (!existingBiz) {
          await storage.createBusiness({
            ownerId: user.id,
            name: "Joe's Coffee House",
            wifiSsid: "Joes_Free_WiFi",
            primaryColor: "#4f46e5",
            address: "123 Main St, Seattle, WA",
          });
        }
      } else {
        return res.status(401).json({ message: "User not found" });
      }
    }

    const business = await storage.getBusinessByOwnerId(user.id);

    res.json({
      id: user.id,
      email: user.username, // Returning username as email
      role: user.role,
      businessId: business?.id,
    });
  });

  app.post(api.auth.signup.path, async (req, res) => {
    const input = api.auth.signup.input.parse(req.body);

    // Check by email (which we store as username)
    const existing = await storage.getUserByUsername(input.email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await storage.createUser({
      username: input.email, // using email as username
      password: input.password,
      role: "business",
      name: input.businessName,
      email: input.email,
    });

    const business = await storage.createBusiness({
      ownerId: user.id,
      name: input.businessName,
      contactEmail: input.email,
      address: input.location,
      onboardingCompleted: false,
    });

    res.status(201).json({
      id: user.id,
      email: user.username,
      role: "business",
      businessId: business.id,
    });
  });

  // Business Routes
  app.get(api.businesses.list.path, async (req, res) => {
    const businesses = await storage.getAllBusinesses();
    res.json(businesses);
  });

  app.get(api.businesses.get.path, async (req, res) => {
    const business = await storage.getBusiness(Number(req.params.id));
    if (!business)
      return res.status(404).json({ message: "Business not found" });
    res.json(business);
  });

  app.put(api.businesses.update.path, async (req, res) => {
    const updates = api.businesses.update.input.parse(req.body);
    const business = await storage.updateBusiness(
      Number(req.params.id),
      updates,
    );
    res.json(business);
  });

  app.get(api.businesses.dashboardStats.path, async (req, res) => {
    const stats = await storage.getDashboardStats(Number(req.params.id));
    res.json(stats);
  });

  // Campaign Routes
  app.get(api.campaigns.list.path, async (req, res) => {
    const campaigns = await storage.getCampaignsByBusiness(
      Number(req.params.businessId),
    );
    res.json(campaigns);
  });

  app.get(api.campaigns.listAll.path, async (req, res) => {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    const input = api.campaigns.create.input.parse(req.body);
    const campaign = await storage.createCampaign(input);
    res.status(201).json(campaign);
  });

  app.patch(api.campaigns.update.path, async (req, res) => {
    const updates = api.campaigns.update.input.parse(req.body);
    const campaign = await storage.updateCampaign(
      Number(req.params.id),
      updates,
    );
    res.json(campaign);
  });

  app.delete(api.campaigns.delete.path, async (req, res) => {
    await storage.deleteCampaign(Number(req.params.id));
    res.status(204).send();
  });

  // Admin Routes
  app.get(api.admin.stats.path, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // Splash Routes
  app.get(api.splash.get.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const business = await storage.getBusiness(businessId);
    if (!business)
      return res.status(404).json({ message: "Business not found" });

    const localCampaigns = await storage.getCampaignsByBusiness(businessId);

    // Public businesses can also display admin/global campaigns that target them.
    // Private businesses only display their own campaigns.
    if (business.profileType === "public") {
      const allCampaigns = await storage.getAllCampaigns();
      const globalCampaigns = allCampaigns.filter((c) => {
        if (c.businessId) return false;
        if (!c.targetBusinessIds || c.targetBusinessIds.length === 0)
          return true;
        return c.targetBusinessIds.includes(businessId);
      });

      const campaigns = [...localCampaigns, ...globalCampaigns].sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
      res.json({ business, campaigns });
      return;
    }

    res.json({ business, campaigns: localCampaigns });
  });

  app.post(api.splash.connect.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const { deviceType, email } = api.splash.connect.input.parse(req.body);

    await storage.logSession(businessId, deviceType || "mobile", email);

    res.json({ success: true, redirectUrl: "https://google.com" });
  });

  // Seed Data Function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUserByUsername("business");
  if (!users) {
    // Create Default Business User
    const user = await storage.createUser({
      username: "business",
      password: "password",
      role: "business",
      name: "Demo Business Owner",
      email: "owner@example.com",
    });

    // Create Business Profile
    const business = await storage.createBusiness({
      ownerId: user.id,
      name: "The Daily Grind Cafe",
      address: "123 Espresso Lane",
      wifiSsid: "DailyGrind_Guest",
      primaryColor: "#0ea5e9", // Sky blue
      profileType: "public",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DG",
    });

    // Create Sample Campaigns
    await storage.createCampaign({
      businessId: business.id,
      title: "Morning Pastry Deal",
      type: "banner",
      contentUrl:
        "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800",
      duration: 5,
    });

    await storage.createCampaign({
      businessId: business.id,
      title: "Coffee Video Ad",
      type: "video",
      contentUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Sample video
      duration: 15,
    });

    await storage.createCampaign({
      businessId: business.id,
      title: "Lunch Special",
      type: "static",
      contentUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      duration: 5,
    });
  }
}
