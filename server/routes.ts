import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === API ROUTES ===

  // Login (Mock)
  app.post(api.auth.login.path, async (req, res) => {
    const { username } = req.body;
    // Simple mock login logic
    let user = await storage.getUserByUsername(username);
    
    // If user doesn't exist, created seeded users based on username content
    if (!user) {
      if (username === 'admin') {
         // Create mock admin
         user = await storage.createUser({ username: 'admin', password: 'password', role: 'admin', name: 'Admin User' });
      } else if (username === 'business') {
         // Create mock business owner
         user = await storage.createUser({ username: 'business', password: 'password', role: 'business', name: 'Joe Coffee' });
         // Ensure business profile exists
         const existingBiz = await storage.getBusinessByOwnerId(user.id);
         if (!existingBiz) {
           await storage.createBusiness({ 
             ownerId: user.id, 
             name: "Joe's Coffee House", 
             wifiSsid: "Joes_Free_WiFi", 
             primaryColor: "#4f46e5",
             address: "123 Main St, Seattle, WA"
           });
         }
      } else {
         return res.status(401).json({ message: "User not found" });
      }
    }

    const business = await storage.getBusinessByOwnerId(user.id);
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      businessId: business?.id
    });
  });

  // Business Routes
  app.get(api.businesses.get.path, async (req, res) => {
    const business = await storage.getBusiness(Number(req.params.id));
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json(business);
  });

  app.put(api.businesses.update.path, async (req, res) => {
    const updates = api.businesses.update.input.parse(req.body);
    const business = await storage.updateBusiness(Number(req.params.id), updates);
    res.json(business);
  });

  app.get(api.businesses.dashboardStats.path, async (req, res) => {
    const stats = await storage.getDashboardStats(Number(req.params.id));
    res.json(stats);
  });

  // Campaign Routes
  app.get(api.campaigns.list.path, async (req, res) => {
    const campaigns = await storage.getCampaignsByBusiness(Number(req.params.businessId));
    res.json(campaigns);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    const input = api.campaigns.create.input.parse(req.body);
    const campaign = await storage.createCampaign(input);
    res.status(201).json(campaign);
  });

  app.delete(api.campaigns.delete.path, async (req, res) => {
    await storage.deleteCampaign(Number(req.params.id));
    res.status(204).send();
  });

  // Splash Routes
  app.get(api.splash.get.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const business = await storage.getBusiness(businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });
    
    const campaigns = await storage.getCampaignsByBusiness(businessId);
    res.json({ business, campaigns });
  });

  app.post(api.splash.connect.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const { deviceType } = req.body;
    
    await storage.logSession(businessId, deviceType || 'mobile');
    
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
      email: "owner@example.com"
    });

    // Create Business Profile
    const business = await storage.createBusiness({
      ownerId: user.id,
      name: "The Daily Grind Cafe",
      address: "123 Espresso Lane",
      wifiSsid: "DailyGrind_Guest",
      primaryColor: "#0ea5e9", // Sky blue
      profileType: "public",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DG"
    });

    // Create Sample Campaigns
    await storage.createCampaign({
      businessId: business.id,
      title: "Morning Pastry Deal",
      type: "banner",
      contentUrl: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&q=80&w=800",
      duration: 5
    });

    await storage.createCampaign({
      businessId: business.id,
      title: "Coffee Video Ad",
      type: "video",
      contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Sample video
      duration: 15
    });
    
    await storage.createCampaign({
      businessId: business.id,
      title: "Lunch Special",
      type: "static",
      contentUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      duration: 5
    });
  }
}
