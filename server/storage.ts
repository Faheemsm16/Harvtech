import {
  users,
  equipment,
  bookings,
  insuranceApplications,
  transportVehicles,
  transportBookings,
  warehouses,
  marketplaceCategories,
  marketplaceProducts,
  cartItems,
  marketplaceOrders,
  type User,
  type UpsertUser,
  type Equipment,
  type InsertEquipment,
  type Booking,
  type InsertBooking,
  type InsuranceApplication,
  type InsertInsuranceApplication,
  type TransportVehicle,
  type InsertTransportVehicle,
  type TransportBooking,
  type InsertTransportBooking,
  type Warehouse,
  type InsertWarehouse,
  type MarketplaceCategory,
  type InsertMarketplaceCategory,
  type MarketplaceProduct,
  type InsertMarketplaceProduct,
  type CartItem,
  type InsertCartItem,
  type MarketplaceOrder,
  type InsertMarketplaceOrder,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  
  // Equipment operations
  getEquipmentByOwner(ownerId: string): Promise<Equipment[]>;
  getEquipmentByType(type: string): Promise<Equipment[]>;
  getEquipmentById(id: string): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipmentAvailability(id: string, availability: string): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByEquipment(equipmentId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string, paymentStatus?: string): Promise<void>;
  
  // Insurance Application operations
  createInsuranceApplication(application: InsertInsuranceApplication): Promise<InsuranceApplication>;
  getInsuranceApplicationsByUser(userId: string): Promise<InsuranceApplication[]>;
  updateInsuranceApplicationStatus(id: string, status: string): Promise<void>;
  
  // Transport Vehicle operations
  getAvailableTransportVehicles(): Promise<TransportVehicle[]>;
  getTransportVehicleById(id: string): Promise<TransportVehicle | undefined>;
  createTransportVehicle(vehicle: InsertTransportVehicle): Promise<TransportVehicle>;
  
  // Transport Booking operations
  createTransportBooking(booking: InsertTransportBooking): Promise<TransportBooking>;
  getTransportBookingsByUser(userId: string): Promise<TransportBooking[]>;
  updateTransportBookingStatus(id: string, bookingStatus: string, paymentStatus?: string): Promise<void>;
  
  // Warehouse operations
  getAvailableWarehouses(): Promise<Warehouse[]>;
  getWarehouseById(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  
  // Marketplace Category operations
  getMarketplaceCategories(): Promise<MarketplaceCategory[]>;
  getMarketplaceCategoryById(id: string): Promise<MarketplaceCategory | undefined>;
  createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory>;
  
  // Marketplace Product operations
  getMarketplaceProducts(categoryId?: string, searchTerm?: string): Promise<MarketplaceProduct[]>;
  getMarketplaceProductById(id: string): Promise<MarketplaceProduct | undefined>;
  getMarketplaceProductsBySeller(sellerId: string): Promise<MarketplaceProduct[]>;
  createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct>;
  updateMarketplaceProduct(id: string, updates: Partial<InsertMarketplaceProduct>): Promise<void>;
  updateMarketplaceProductStatus(id: string, status: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: MarketplaceProduct })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<void>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Marketplace Order operations
  createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder>;
  getMarketplaceOrdersByBuyer(buyerId: string): Promise<MarketplaceOrder[]>;
  getMarketplaceOrdersBySeller(sellerId: string): Promise<MarketplaceOrder[]>;
  updateMarketplaceOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Equipment operations
  async getEquipmentByOwner(ownerId: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.ownerId, ownerId));
  }

  async getEquipmentByType(type: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(
      and(eq(equipment.type, type), eq(equipment.availability, 'available'))
    );
  }

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    const [result] = await db.select().from(equipment).where(eq(equipment.id, id));
    return result;
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [result] = await db
      .insert(equipment)
      .values(equipmentData)
      .returning();
    return result;
  }

  async updateEquipmentAvailability(id: string, availability: string): Promise<void> {
    await db
      .update(equipment)
      .set({ availability, updatedAt: new Date() })
      .where(eq(equipment.id, id));
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByEquipment(equipmentId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.equipmentId, equipmentId));
  }

  async updateBookingStatus(id: string, status: string, paymentStatus?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id));
  }

  // Insurance Application operations
  async createInsuranceApplication(applicationData: InsertInsuranceApplication): Promise<InsuranceApplication> {
    const [application] = await db
      .insert(insuranceApplications)
      .values(applicationData)
      .returning();
    return application;
  }

  async getInsuranceApplicationsByUser(userId: string): Promise<InsuranceApplication[]> {
    return await db.select().from(insuranceApplications).where(eq(insuranceApplications.userId, userId));
  }

  async updateInsuranceApplicationStatus(id: string, status: string): Promise<void> {
    await db
      .update(insuranceApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(insuranceApplications.id, id));
  }

  // Transport Vehicle operations
  async getAvailableTransportVehicles(): Promise<TransportVehicle[]> {
    return await db.select().from(transportVehicles).where(eq(transportVehicles.isAvailable, true));
  }

  async getTransportVehicleById(id: string): Promise<TransportVehicle | undefined> {
    const [vehicle] = await db.select().from(transportVehicles).where(eq(transportVehicles.id, id));
    return vehicle;
  }

  async createTransportVehicle(vehicleData: InsertTransportVehicle): Promise<TransportVehicle> {
    const [vehicle] = await db
      .insert(transportVehicles)
      .values(vehicleData)
      .returning();
    return vehicle;
  }

  // Transport Booking operations
  async createTransportBooking(bookingData: InsertTransportBooking): Promise<TransportBooking> {
    const [booking] = await db
      .insert(transportBookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getTransportBookingsByUser(userId: string): Promise<TransportBooking[]> {
    return await db.select().from(transportBookings).where(eq(transportBookings.userId, userId));
  }

  async updateTransportBookingStatus(id: string, bookingStatus: string, paymentStatus?: string): Promise<void> {
    const updateData: any = { bookingStatus, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await db
      .update(transportBookings)
      .set(updateData)
      .where(eq(transportBookings.id, id));
  }

  // Warehouse operations
  async getAvailableWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses).where(eq(warehouses.isActive, true));
  }

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse;
  }

  async createWarehouse(warehouseData: InsertWarehouse): Promise<Warehouse> {
    const [warehouse] = await db
      .insert(warehouses)
      .values(warehouseData)
      .returning();
    return warehouse;
  }

  // Marketplace Category operations
  async getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
    return await db.select().from(marketplaceCategories).where(eq(marketplaceCategories.isActive, true));
  }

  async getMarketplaceCategoryById(id: string): Promise<MarketplaceCategory | undefined> {
    const [category] = await db.select().from(marketplaceCategories).where(eq(marketplaceCategories.id, id));
    return category;
  }

  async createMarketplaceCategory(categoryData: InsertMarketplaceCategory): Promise<MarketplaceCategory> {
    const [category] = await db
      .insert(marketplaceCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  // Marketplace Product operations
  async getMarketplaceProducts(categoryId?: string, searchTerm?: string): Promise<MarketplaceProduct[]> {
    let query = db.select().from(marketplaceProducts).where(eq(marketplaceProducts.isActive, true));

    const conditions = [eq(marketplaceProducts.isActive, true)];
    
    if (categoryId) {
      conditions.push(eq(marketplaceProducts.categoryId, categoryId));
    }
    
    if (searchTerm) {
      conditions.push(
        or(
          ilike(marketplaceProducts.name, `%${searchTerm}%`),
          ilike(marketplaceProducts.description, `%${searchTerm}%`)
        )!
      );
    }

    return await db.select().from(marketplaceProducts).where(and(...conditions));
  }

  async getMarketplaceProductById(id: string): Promise<MarketplaceProduct | undefined> {
    const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, id));
    return product;
  }

  async getMarketplaceProductsBySeller(sellerId: string): Promise<MarketplaceProduct[]> {
    return await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.sellerId, sellerId));
  }

  async createMarketplaceProduct(productData: InsertMarketplaceProduct): Promise<MarketplaceProduct> {
    const [product] = await db
      .insert(marketplaceProducts)
      .values(productData)
      .returning();
    return product;
  }

  async updateMarketplaceProduct(id: string, updates: Partial<InsertMarketplaceProduct>): Promise<void> {
    await db
      .update(marketplaceProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(marketplaceProducts.id, id));
  }

  async updateMarketplaceProductStatus(id: string, status: string): Promise<void> {
    await db
      .update(marketplaceProducts)
      .set({ status, updatedAt: new Date() })
      .where(eq(marketplaceProducts.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: MarketplaceProduct })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: marketplaceProducts,
      })
      .from(cartItems)
      .innerJoin(marketplaceProducts, eq(cartItems.productId, marketplaceProducts.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItemData.userId),
          eq(cartItems.productId, cartItemData.productId)
        )
      );

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + cartItemData.quantity;
      await db
        .update(cartItems)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id));
      
      const [updatedItem] = await db.select().from(cartItems).where(eq(cartItems.id, existingItem.id));
      return updatedItem;
    } else {
      // Create new cart item
      const [cartItem] = await db
        .insert(cartItems)
        .values(cartItemData)
        .returning();
      return cartItem;
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(id);
    } else {
      await db
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, id));
    }
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Marketplace Order operations
  async createMarketplaceOrder(orderData: InsertMarketplaceOrder): Promise<MarketplaceOrder> {
    const [order] = await db
      .insert(marketplaceOrders)
      .values(orderData)
      .returning();
    return order;
  }

  async getMarketplaceOrdersByBuyer(buyerId: string): Promise<MarketplaceOrder[]> {
    return await db.select().from(marketplaceOrders).where(eq(marketplaceOrders.buyerId, buyerId));
  }

  async getMarketplaceOrdersBySeller(sellerId: string): Promise<MarketplaceOrder[]> {
    return await db.select().from(marketplaceOrders).where(eq(marketplaceOrders.sellerId, sellerId));
  }

  async updateMarketplaceOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<void> {
    const updateData: any = { orderStatus, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await db
      .update(marketplaceOrders)
      .set(updateData)
      .where(eq(marketplaceOrders.id, id));
  }
}

export const storage = new DatabaseStorage();
