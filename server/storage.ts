import {
  users,
  equipment,
  bookings,
  insuranceApplications,
  transportVehicles,
  transportBookings,
  warehouses,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  updateUserProfile(id: string, profileData: { email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<void>;
  
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

  async updateUserProfile(id: string, profileData: { email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<void> {
    await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
