import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["customer", "admin", "manager", "support"] }).default("customer").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  location: text("location").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: jsonb("amenities").$type<string[]>().notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  status: text("status", { enum: ["available", "booked", "maintenance"] }).default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  type: text("type", { enum: ["booking", "payment", "maintenance", "system"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  apartmentId: integer("apartment_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update existing tables with soft delete and better status for CRM
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  apartmentId: integer("apartment_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] }).default("pending").notNull(),
  paymentStatus: text("payment_status", { enum: ["paid", "unpaid"] }).default("unpaid").notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  apartmentId: integer("apartment_id").notNull(),
  userId: integer("user_id").notNull(), // User who reported it
  description: text("description").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  status: text("status", { enum: ["open", "in_progress", "resolved"] }).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  provider: text("provider", { enum: ["stripe", "paystack"] }).notNull(),
  transactionId: text("transaction_id"), // External ID
  status: text("status", { enum: ["pending", "success", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  maintenanceRequests: many(maintenanceRequests),
  payments: many(payments),
}));

export const apartmentsRelations = relations(apartments, ({ many }) => ({
  bookings: many(bookings),
  maintenanceRequests: many(maintenanceRequests),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  apartment: one(apartments, {
    fields: [bookings.apartmentId],
    references: [apartments.id],
  }),
  payments: many(payments),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertApartmentSchema = createInsertSchema(apartments).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true, paymentStatus: true, status: true })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  });
export const insertMaintenanceSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true, status: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Apartment = typeof apartments.$inferSelect;
export type InsertApartment = z.infer<typeof insertApartmentSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type Payment = typeof payments.$inferSelect;
