import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { insertApartmentSchema, type User } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // === Apartments ===
  app.get(api.apartments.list.path, async (req, res) => {
    const filters = {
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
    };
    const apartments = await storage.getApartments(filters);
    res.json(apartments);
  });

  app.get(api.apartments.get.path, async (req, res) => {
    const apartment = await storage.getApartment(Number(req.params.id));
    if (!apartment) return res.sendStatus(404);
    res.json(apartment);
  });

  app.post(api.apartments.create.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user || user.role !== 'admin') return res.sendStatus(401);
    const parsed = api.apartments.create.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const apartment = await storage.createApartment(parsed.data);
    res.status(201).json(apartment);
  });

  app.put(api.apartments.update.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user || user.role !== 'admin') return res.sendStatus(401);
    const parsed = api.apartments.update.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const updated = await storage.updateApartment(Number(req.params.id), parsed.data);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // === Bookings ===
  app.get(api.bookings.list.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user) return res.sendStatus(401);
    if (user.role === 'customer') {
      const bookings = await storage.getBookingsByUser(user.id);
      return res.json(bookings);
    }
    // Admin/Manager see all
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user) return res.sendStatus(401);
    const parsed = api.bookings.create.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const booking = await storage.createBooking({ ...parsed.data, userId: user.id });
    res.status(201).json(booking);
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user || !['admin', 'manager'].includes(user.role)) return res.sendStatus(401);
    const booking = await storage.updateBookingStatus(Number(req.params.id), req.body.status);
    if (!booking) return res.sendStatus(404);
    res.json(booking);
  });

  // === Maintenance ===
  app.get(api.maintenance.list.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user) return res.sendStatus(401);
    const requests = await storage.getMaintenanceRequests();
    if (user.role === 'customer') {
        // Only show their own
        return res.json(requests.filter(r => r.userId === user.id));
    }
    res.json(requests);
  });

  app.post(api.maintenance.create.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user) return res.sendStatus(401);
    const parsed = api.maintenance.create.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    // @ts-ignore
    const request = await storage.createMaintenanceRequest({ ...parsed.data, userId: user.id, priority: "medium" });
    res.status(201).json(request);
  });

  app.patch(api.maintenance.updateStatus.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user || !['support', 'admin', 'manager'].includes(user.role)) return res.sendStatus(401);
    const updated = await storage.updateMaintenanceStatus(Number(req.params.id), req.body.status);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // === Payments ===
  app.post(api.payments.process.path, async (req, res) => {
    const user = req.user as User | undefined;
    if (!req.isAuthenticated() || !user) return res.sendStatus(401);
    const parsed = api.payments.process.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    
    // TODO_PAYMENT_PROVIDER: Integrate Stripe/Paystack SDK here
    // const provider = parsed.data.provider;
    // const paymentIntent = await stripe.paymentIntents.create(...) 

    // Mock success for now
    // @ts-ignore
    const payment = await storage.createPayment({ ...parsed.data, userId: user.id });
    res.status(201).json(payment);
  });

  // Seed Data
  if (process.env.NODE_ENV !== 'production') {
    const existingUsers = await storage.getUserByUsername("admin");
    if (!existingUsers) {
      await storage.createUser({
        username: "admin",
        password: "password123", // TODO: Hash this in real implementation (Auth setup handles hashing usually, but for seed we cheat or use helper)
        role: "admin",
        name: "Giovanni Paul Sodipo",
        email: "admin@lumiere.com",
        phone: "1234567890"
      });
      await storage.createUser({
        username: "user",
        password: "password123",
        role: "customer",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "0987654321"
      });
      
      // Seed Apartments
      await storage.createApartment({
        title: "Luxury Penthouse Suite",
        description: "Experience the height of luxury in our top-floor penthouse with panoramic city views.",
        price: 500000, // $5000.00
        location: "Downtown Metropolis",
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["Pool", "Gym", "Concierge", "WiFi"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"],
        status: "available"
      });
      
       await storage.createApartment({
        title: "Cozy Studio in Arts District",
        description: "Perfect for the solo traveler or couple. Close to all the best galleries.",
        price: 150000, // $1500.00
        location: "Arts District",
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["WiFi", "Kitchenette"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"],
        status: "available"
      });
    }
  }

  return httpServer;
}
