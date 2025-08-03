import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  mobileNumber: varchar("mobile_number", { length: 10 }).unique().notNull(),
  role: varchar("role", { length: 10 }).notNull(), // 'user' or 'owner'
  farmerId: varchar("farmer_id").unique().notNull(),
  name: varchar("name").notNull(),
  city: varchar("city"),
  country: varchar("country").default("India"),
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment table for owners
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'tractor', 'weeder', 'tiller'
  name: varchar("name").notNull(),
  modelNumber: varchar("model_number").notNull(),
  chassisNumber: varchar("chassis_number").notNull(),
  power: varchar("power"),
  year: integer("year"),
  pricePerDay: integer("price_per_day"), // in rupees
  location: varchar("location"),
  availability: varchar("availability").default("available"), // 'available', 'rented', 'maintenance'
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  equipmentId: varchar("equipment_id").references(() => equipment.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalCost: integer("total_cost").notNull(),
  securityDeposit: integer("security_deposit").notNull(),
  status: varchar("status").default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'paid', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  mobileNumber: true,
  role: true,
  name: true,
  city: true,
  country: true,
  aadhaarNumber: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).pick({
  ownerId: true,
  type: true,
  name: true,
  modelNumber: true,
  chassisNumber: true,
  power: true,
  year: true,
  pricePerDay: true,
  location: true,
  imageUrl: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  equipmentId: true,
  startDate: true,
  endDate: true,
  totalCost: true,
  securityDeposit: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
