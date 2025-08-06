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
  type: varchar("type").notNull(), // 'tractor', 'weeder'
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

// Orders table for marketplace purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderNumber: varchar("order_number").notNull().unique(),
  totalAmount: integer("total_amount").notNull(), // in paise
  deliveryFee: integer("delivery_fee").default(5000), // in paise (₹50)
  status: varchar("status").default("pending"), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  paymentMethod: varchar("payment_method").notNull(), // 'upi', 'cod', 'card'
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'paid', 'failed'
  
  // Delivery address
  deliveryName: varchar("delivery_name").notNull(),
  deliveryMobile: varchar("delivery_mobile").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: varchar("delivery_city").notNull(),
  deliveryState: varchar("delivery_state").notNull(),
  deliveryPincode: varchar("delivery_pincode").notNull(),
  deliveryLandmark: varchar("delivery_landmark"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Insurance Applications table
export const insuranceApplications = pgTable("insurance_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Farmer Details (Page 1)
  fullName: varchar("full_name").notNull(),
  fatherHusbandName: varchar("father_husband_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: varchar("gender").notNull(), // 'Male', 'Female'
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 10 }).notNull(),
  address: text("address").notNull(),
  state: varchar("state").notNull(),
  district: varchar("district").notNull(),
  villagePanchayat: varchar("village_panchayat").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  
  // Land/Crop Details (Page 2)
  surveyKhasraNumber: varchar("survey_khasra_number").notNull(),
  totalLandHolding: varchar("total_land_holding").notNull(),
  landOwnership: varchar("land_ownership").notNull(), // 'Owned', 'Leased', 'Tenant'
  cropSeason: varchar("crop_season").notNull(), // 'Kharif', 'Rabi', 'Zaid'
  cropType: varchar("crop_type").notNull(),
  sowingDate: timestamp("sowing_date").notNull(),
  expectedHarvestDate: timestamp("expected_harvest_date").notNull(),
  irrigationType: varchar("irrigation_type").notNull(), // 'Irrigated', 'Rainfed'
  
  // Bank Details (Page 3)
  bankName: varchar("bank_name").notNull(),
  branchName: varchar("branch_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  ifscCode: varchar("ifsc_code").notNull(),
  
  // Document URLs (Page 4)
  aadhaarDocumentUrl: varchar("aadhaar_document_url"),
  bankPassbookUrl: varchar("bank_passbook_url"),
  landRecordUrl: varchar("land_record_url"),
  cropPhotoUrl: varchar("crop_photo_url"),
  
  // Declaration (Page 5)
  declarationAccepted: boolean("declaration_accepted").default(false),
  
  // Application Status
  status: varchar("status").default("draft"), // 'draft', 'submitted', 'under_review', 'approved', 'rejected'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transport Vehicles table
export const transportVehicles = pgTable("transport_vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleType: varchar("vehicle_type").notNull(), // 'Mini Truck', 'Tractor Trolley', 'Lorry'
  vehicleName: varchar("vehicle_name").notNull(),
  imageUrl: varchar("image_url"),
  pricePerKm: integer("price_per_km").notNull(), // in rupees
  capacity: varchar("capacity").notNull(), // e.g., "5 Ton", "2 Quintal"
  estimatedTime: varchar("estimated_time"), // e.g., "2-3 hours"
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transport Bookings table
export const transportBookings = pgTable("transport_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  vehicleId: varchar("vehicle_id").references(() => transportVehicles.id).notNull(),
  
  // Location details
  pickupLatitude: varchar("pickup_latitude").notNull(),
  pickupLongitude: varchar("pickup_longitude").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropLatitude: varchar("drop_latitude").notNull(),
  dropLongitude: varchar("drop_longitude").notNull(),
  dropAddress: text("drop_address").notNull(),
  
  // Load details
  loadQuantity: varchar("load_quantity").notNull(),
  loadUnit: varchar("load_unit").notNull(), // 'KG', 'Quintal', 'Ton'
  
  // Booking details
  totalDistance: varchar("total_distance"), // in km
  totalCost: integer("total_cost").notNull(), // in rupees
  estimatedTime: varchar("estimated_time"),
  
  // Payment and status
  paymentMethod: varchar("payment_method"), // 'UPI', 'Card', 'Wallet'
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'paid', 'failed'
  bookingStatus: varchar("booking_status").default("pending"), // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Warehouses table
export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude").notNull(),
  longitude: varchar("longitude").notNull(),
  capacity: varchar("capacity").notNull(), // e.g., "500 Quintal", "200 Ton"
  availableSpace: varchar("available_space").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(), // in rupees per quintal/ton per month
  priceUnit: varchar("price_unit").notNull(), // 'Quintal', 'Ton'
  contactNumber: varchar("contact_number"),
  ownerName: varchar("owner_name"),
  facilities: text("facilities"), // JSON string of facilities like "Climate Controlled", "Security", etc.
  warehouseType: varchar("warehouse_type").notNull(), // 'Government', 'Private', 'Cooperative'
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace Products table
export const marketplaceProducts = pgTable("marketplace_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  category: varchar("category").notNull(), // 'seeds', 'crops', 'fertilizers', 'dairy'
  productName: varchar("product_name").notNull(),
  productDescription: text("product_description"),
  quantity: integer("quantity").notNull(),
  quantityUnit: varchar("quantity_unit").notNull(), // 'KG', 'Quintal', 'Packet', 'Piece'
  pricePerUnit: integer("price_per_unit").notNull(), // in rupees
  imageUrls: text("image_urls"), // JSON array of image URLs
  isAvailable: boolean("is_available").default(true),
  totalSold: integer("total_sold").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => marketplaceProducts.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace Orders table
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(), // in rupees
  orderStatus: varchar("order_status").default("pending"), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  paymentMethod: varchar("payment_method").notNull(), // 'UPI', 'Debit Card', 'Wallet', 'COD'
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'paid', 'failed'
  shippingAddress: text("shipping_address"),
  estimatedDelivery: varchar("estimated_delivery"), // e.g., "3-5 days"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items table (join table for orders and products)
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => marketplaceOrders.id).notNull(),
  productId: varchar("product_id").references(() => marketplaceProducts.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(),
  subtotal: integer("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export const insertInsuranceApplicationSchema = createInsertSchema(insuranceApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportVehicleSchema = createInsertSchema(transportVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportBookingSchema = createInsertSchema(transportBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  productDescription: z.string().optional(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type InsuranceApplication = typeof insuranceApplications.$inferSelect;
export type InsertInsuranceApplication = z.infer<typeof insertInsuranceApplicationSchema>;
export type TransportVehicle = typeof transportVehicles.$inferSelect;
export type InsertTransportVehicle = z.infer<typeof insertTransportVehicleSchema>;
export type TransportBooking = typeof transportBookings.$inferSelect;
export type InsertTransportBooking = z.infer<typeof insertTransportBookingSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;
export type MarketplaceOrderItem = typeof orderItems.$inferSelect;
export type InsertMarketplaceOrderItem = z.infer<typeof insertMarketplaceOrderItemSchema>;
