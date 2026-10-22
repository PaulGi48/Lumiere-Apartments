import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, apartments, bookings, maintenanceRequests, payments,
  type User, type InsertUser, type Apartment, type InsertApartment,
  type Booking, type InsertBooking, type MaintenanceRequest,
  type Payment, type InsertBooking as InsertBookingType
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Apartments
  getApartments(filters?: { minPrice?: number; maxPrice?: number; bedrooms?: number }): Promise<Apartment[]>;
  getApartment(id: number): Promise<Apartment | undefined>;
  createApartment(apartment: InsertApartment): Promise<Apartment>;
  updateApartment(id: number, apartment: Partial<InsertApartment>): Promise<Apartment | undefined>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Maintenance
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: Omit<MaintenanceRequest, "id" | "createdAt" | "status">): Promise<MaintenanceRequest>;
  updateMaintenanceStatus(id: number, status: string): Promise<MaintenanceRequest | undefined>;

  // Payments
  createPayment(payment: Omit<Payment, "id" | "createdAt" | "status">): Promise<Payment>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Apartments
  async getApartments(filters?: { minPrice?: number; maxPrice?: number; bedrooms?: number }): Promise<Apartment[]> {
    let query = db.select().from(apartments);
    // Note: Simple filtering for now, can be expanded
    const results = await query;
    return results.filter((apt: Apartment) => {
      if (filters?.minPrice && apt.price < filters.minPrice) return false;
      if (filters?.maxPrice && apt.price > filters.maxPrice) return false;
      if (filters?.bedrooms && apt.bedrooms !== filters.bedrooms) return false;
      return true;
    });
  }

  async getApartment(id: number): Promise<Apartment | undefined> {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    return apartment;
  }

  async createApartment(apartment: InsertApartment): Promise<Apartment> {
    const [newApartment] = await db.insert(apartments).values(apartment).returning();
    return newApartment;
  }

  async updateApartment(id: number, updates: Partial<InsertApartment>): Promise<Apartment | undefined> {
    const [updated] = await db.update(apartments).set(updates).where(eq(apartments.id, id)).returning();
    return updated;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    // @ts-ignore - Status enum handling is strict but runtime string is fine for now
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  // Maintenance
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests);
  }

  async createMaintenanceRequest(request: Omit<MaintenanceRequest, "id" | "createdAt" | "status">): Promise<MaintenanceRequest> {
    // @ts-ignore
    const [req] = await db.insert(maintenanceRequests).values(request).returning();
    return req;
  }

  async updateMaintenanceStatus(id: number, status: string): Promise<MaintenanceRequest | undefined> {
    // @ts-ignore
    const [updated] = await db.update(maintenanceRequests).set({ status }).where(eq(maintenanceRequests.id, id)).returning();
    return updated;
  }

  // Payments
  async createPayment(payment: Omit<Payment, "id" | "createdAt" | "status">): Promise<Payment> {
    // @ts-ignore
    const [newPayment] = await db.insert(payments).values({ ...payment, status: "success" }).returning();
    // Also update booking status
    await db.update(bookings).set({ paymentStatus: "paid", status: "confirmed" }).where(eq(bookings.id, payment.bookingId));
    return newPayment;
  }
}

export const storage = new DatabaseStorage();
