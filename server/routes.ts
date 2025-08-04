import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertEquipmentSchema, insertBookingSchema, insertInsuranceApplicationSchema, insertTransportVehicleSchema, insertTransportBookingSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User registration (mock OTP system)
  app.post('/api/register', async (req, res) => {
    try {
      const registrationData = req.body;
      
      // Validate input
      const validatedData = insertUserSchema.parse(registrationData);
      
      // Check if mobile number already exists
      const existingUser = await storage.getUserByMobile(validatedData.mobileNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Mobile number already registered" });
      }
      
      // Generate farmer ID
      const farmerId = `FRM-${Date.now().toString().slice(-6)}`;
      
      // Create user
      const userData = {
        ...validatedData,
        farmerId,
        isVerified: true, // Mock OTP verification
      };
      
      const user = await storage.createUser(userData);
      res.json({ user, farmerId });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Check mobile number registration
  app.post('/api/check-mobile', async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      const user = await storage.getUserByMobile(mobileNumber);
      res.json({ isRegistered: !!user, user: user || null });
    } catch (error) {
      console.error("Mobile check error:", error);
      res.status(500).json({ message: "Failed to check mobile number" });
    }
  });

  // Mock OTP endpoints
  app.post('/api/send-otp', async (req, res) => {
    // Mock OTP sending - always return success
    res.json({ success: true, message: "OTP sent successfully" });
  });

  app.post('/api/verify-otp', async (req, res) => {
    const { mobileNumber, otp } = req.body;
    
    // Mock OTP verification - accept "123456" as valid OTP
    if (otp === "123456") {
      const user = await storage.getUserByMobile(mobileNumber);
      res.json({ success: true, user });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  });

  // Equipment routes
  app.get('/api/equipment/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const equipmentList = await storage.getEquipmentByType(type);
      res.json(equipmentList);
    } catch (error) {
      console.error("Equipment fetch error:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get('/api/equipment/details/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const equipmentItem = await storage.getEquipmentById(id);
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipmentItem);
    } catch (error) {
      console.error("Equipment details error:", error);
      res.status(500).json({ message: "Failed to fetch equipment details" });
    }
  });

  app.post('/api/equipment', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const equipmentData = { ...req.body, ownerId };
      
      const validatedData = insertEquipmentSchema.parse(equipmentData);
      const equipment = await storage.createEquipment(validatedData);
      
      res.json(equipment);
    } catch (error) {
      console.error("Equipment creation error:", error);
      res.status(400).json({ message: "Failed to create equipment" });
    }
  });

  app.get('/api/owner/equipment', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const ownerEquipment = await storage.getEquipmentByOwner(ownerId);
      res.json(ownerEquipment);
    } catch (error) {
      console.error("Owner equipment error:", error);
      res.status(500).json({ message: "Failed to fetch owner equipment" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = { ...req.body, userId };
      
      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      
      // Update equipment availability
      await storage.updateEquipmentAvailability(validatedData.equipmentId, 'rented');
      
      res.json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/user/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBookings = await storage.getBookingsByUser(userId);
      res.json(userBookings);
    } catch (error) {
      console.error("User bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.patch('/api/bookings/:id/payment', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      
      await storage.updateBookingStatus(id, status, paymentStatus);
      res.json({ success: true });
    } catch (error) {
      console.error("Booking update error:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Insurance Application routes
  app.post('/api/insurance-applications', isAuthenticated, async (req: any, res) => {
    try {
      const applicationData = req.body;
      
      const validatedData = insertInsuranceApplicationSchema.parse(applicationData);
      const application = await storage.createInsuranceApplication(validatedData);
      
      res.json(application);
    } catch (error) {
      console.error("Insurance application creation error:", error);
      res.status(400).json({ message: "Failed to create insurance application" });
    }
  });

  app.get('/api/insurance-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getInsuranceApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Insurance applications fetch error:", error);
      res.status(500).json({ message: "Failed to fetch insurance applications" });
    }
  });

  app.patch('/api/insurance-applications/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await storage.updateInsuranceApplicationStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Insurance application update error:", error);
      res.status(500).json({ message: "Failed to update insurance application" });
    }
  });

  // Transport Vehicle routes
  app.get('/api/transport/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getAvailableTransportVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Transport vehicles fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transport vehicles" });
    }
  });

  app.get('/api/transport/vehicles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getTransportVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Transport vehicle fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transport vehicle" });
    }
  });

  app.post('/api/transport/vehicles', async (req, res) => {
    try {
      const vehicleData = req.body;
      const validatedData = insertTransportVehicleSchema.parse(vehicleData);
      const vehicle = await storage.createTransportVehicle(validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Transport vehicle creation error:", error);
      res.status(400).json({ message: "Failed to create transport vehicle" });
    }
  });

  // Transport Booking routes
  app.post('/api/transport/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = { ...req.body, userId };
      
      const validatedData = insertTransportBookingSchema.parse(bookingData);
      const booking = await storage.createTransportBooking(validatedData);
      
      res.json(booking);
    } catch (error) {
      console.error("Transport booking creation error:", error);
      res.status(400).json({ message: "Failed to create transport booking" });
    }
  });

  app.get('/api/transport/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getTransportBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Transport bookings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transport bookings" });
    }
  });

  app.patch('/api/transport/bookings/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { bookingStatus, paymentStatus } = req.body;
      
      await storage.updateTransportBookingStatus(id, bookingStatus, paymentStatus);
      res.json({ success: true });
    } catch (error) {
      console.error("Transport booking update error:", error);
      res.status(500).json({ message: "Failed to update transport booking" });
    }
  });

  // Database seeding endpoint (for development)
  app.post('/api/seed-database', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
