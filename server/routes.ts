import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserSchema, 
  insertEquipmentSchema, 
  insertBookingSchema, 
  insertInsuranceApplicationSchema, 
  insertTransportVehicleSchema, 
  insertTransportBookingSchema, 
  insertWarehouseSchema, 
  insertMarketplaceProductSchema, 
  insertCartItemSchema, 
  insertMarketplaceOrderSchema,
  insertMarketplaceOrderItemSchema,
  marketplaceOrders,
  orderItems,
  marketplaceProducts,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (commented out for development)
  // await setupAuth(app);
  
  // Mock authentication middleware for development
  app.use((req: any, res, next) => {
    req.isAuthenticated = () => true;
    req.user = {
      claims: {
        sub: 'dev-user-id-123'
      }
    };
    next();
  });

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

  // Seed database route (for development)
  app.post('/api/seed-database', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Seed only marketplace products (for development)
  app.post('/api/seed-products', async (req, res) => {
    try {
      const sampleMarketplaceProducts = [
        // Seeds
        {
          sellerId: "sample-owner-1",
          category: "seeds",
          productName: "Basmati Rice Seeds",
          productDescription: "Premium quality Basmati rice seeds with high yield potential. Suitable for kharif season.",
          quantity: 100,
          quantityUnit: "KG",
          pricePerUnit: 150,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        {
          sellerId: "sample-owner-2",
          category: "seeds",
          productName: "Tomato Hybrid Seeds",
          productDescription: "Disease resistant tomato seeds with excellent yield. Perfect for greenhouse cultivation.",
          quantity: 50,
          quantityUnit: "Packet",
          pricePerUnit: 250,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        {
          sellerId: "sample-owner-3",
          category: "seeds",
          productName: "Corn Seeds (Sweet Corn)",
          productDescription: "High quality sweet corn seeds with 85% germination rate. Suitable for all seasons.",
          quantity: 75,
          quantityUnit: "KG",
          pricePerUnit: 180,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        // Fertilizers
        {
          sellerId: "sample-owner-2",
          category: "fertilizers",
          productName: "NPK 19:19:19",
          productDescription: "Balanced NPK fertilizer suitable for all crops. Water soluble and fast acting.",
          quantity: 25,
          quantityUnit: "KG",
          pricePerUnit: 85,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        {
          sellerId: "sample-owner-5",
          category: "fertilizers",
          productName: "Organic Compost",
          productDescription: "100% organic compost made from farm waste. Rich in nutrients and beneficial microorganisms.",
          quantity: 100,
          quantityUnit: "KG",
          pricePerUnit: 35,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        // Pesticides
        {
          sellerId: "sample-owner-3",
          category: "pesticides",
          productName: "Neem Oil Pesticide",
          productDescription: "100% organic neem oil for pest control. Safe for beneficial insects and environment.",
          quantity: 20,
          quantityUnit: "Liter",
          pricePerUnit: 450,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        // Equipment
        {
          sellerId: "sample-owner-1",
          category: "equipments",
          productName: "Manual Seed Drill",
          productDescription: "Manual seed drill for small farm operations. Ensures proper seed spacing and depth.",
          quantity: 5,
          quantityUnit: "Piece",
          pricePerUnit: 2500,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        },
        // Others
        {
          sellerId: "sample-owner-6",
          category: "others",
          productName: "Plastic Mulch Film",
          productDescription: "Black plastic mulch film for weed control and moisture retention. 25 micron thickness.",
          quantity: 100,
          quantityUnit: "Meter",
          pricePerUnit: 12,
          imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
          isAvailable: true,
        }
      ];

      for (const product of sampleMarketplaceProducts) {
        try {
          await storage.createProduct(product);
          console.log(`Created marketplace product: ${product.productName}`);
        } catch (error) {
          console.log(`Product already exists or error: ${product.productName}`);
        }
      }
      
      res.json({ message: "Sample products added successfully" });
    } catch (error) {
      console.error("Error seeding products:", error);
      res.status(500).json({ message: "Failed to seed products" });
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
      const userId = req.user.claims.sub;
      const applicationData = { ...req.body, userId };
      
      // Convert string dates to Date objects
      if (applicationData.dateOfBirth && typeof applicationData.dateOfBirth === 'string') {
        applicationData.dateOfBirth = new Date(applicationData.dateOfBirth);
      }
      if (applicationData.sowingDate && typeof applicationData.sowingDate === 'string') {
        applicationData.sowingDate = new Date(applicationData.sowingDate);
      }
      if (applicationData.expectedHarvestDate && typeof applicationData.expectedHarvestDate === 'string') {
        applicationData.expectedHarvestDate = new Date(applicationData.expectedHarvestDate);
      }
      
      // Add default values for required fields if missing
      if (!applicationData.accountNumber) {
        applicationData.accountNumber = applicationData.bankName ? `DEMO${Math.random().toString().slice(2, 12)}` : '';
      }
      if (!applicationData.ifscCode) {
        applicationData.ifscCode = applicationData.bankName ? `DEMO0001234` : '';
      }
      
      const validatedData = insertInsuranceApplicationSchema.parse(applicationData);
      const application = await storage.upsertInsuranceApplication(validatedData);
      
      res.json(application);
    } catch (error) {
      console.error("Insurance application creation error:", error);
      console.error("Validation details:", error.errors || error.issues);
      res.status(400).json({ message: "Failed to create insurance application", details: error.message });
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

  app.get('/api/insurance-applications/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getInsuranceApplicationByUser(userId);
      res.json(application || null);
    } catch (error) {
      console.error("Current insurance application fetch error:", error);
      res.status(500).json({ message: "Failed to fetch current insurance application" });
    }
  });

  // Get available insurance options
  app.get('/api/insurance-options', async (req, res) => {
    try {
      const insuranceOptions = [
        {
          id: 'money-support-farmers',
          name: 'Money Support for Farmers',
          category: 'Financial Support',
          schemeActualName: 'Pradhan Mantri Kisan Samman Nidhi',
          eligibility: 'Small and marginal farmers',
          whatTheyGet: '₹6,000/year (₹2,000 every 4 months)',
          details: 'Money sent to farmers bank accounts to support farming.',
          linkToApply: 'https://pmkisan.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['financial support', 'direct benefit transfer', 'small farmers']
        },
        {
          id: 'crop-loss-insurance',
          name: 'Crop Loss Insurance',
          category: 'Crop Insurance',
          schemeActualName: 'Pradhan Mantri Fasal Bima Yojana',
          eligibility: 'All farmers',
          whatTheyGet: 'Compensation for damaged crops',
          details: 'Farmers pay low premium, get money if crops are damaged.',
          linkToApply: 'https://pmfby.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['crop insurance', 'compensation', 'crop damage']
        },
        {
          id: 'water-facility-farmers',
          name: 'Water Facility for Farmers',
          category: 'Infrastructure Support',
          schemeActualName: 'Pradhan Mantri Krishi Sinchayi Yojana',
          eligibility: 'All farmers',
          whatTheyGet: 'Help to build irrigation systems',
          details: 'Support for drip, canal, and sprinkler systems.',
          linkToApply: 'https://pmksy.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['irrigation', 'water facility', 'infrastructure']
        },
        {
          id: 'online-crop-selling',
          name: 'Online Crop Selling Help',
          category: 'Market Access',
          schemeActualName: 'Electronic National Agriculture Market',
          eligibility: 'Farmers, traders',
          whatTheyGet: 'Platform to sell crops online',
          details: 'Sell produce to distant buyers for better price.',
          linkToApply: 'https://enam.gov.in/web/',
          eligibilityStatus: 'eligible',
          tags: ['online selling', 'market access', 'better prices']
        },
        {
          id: 'monthly-pension-old-farmers',
          name: 'Monthly Pension for Old Farmers',
          category: 'Social Security',
          schemeActualName: 'Pradhan Mantri Kisan Maandhan Yojana',
          eligibility: 'Farmers aged 18-40',
          whatTheyGet: '₹3,000/month pension after 60',
          details: 'Monthly contributions lead to pension after 60.',
          linkToApply: 'https://maandhan.in/',
          eligibilityStatus: 'partially-eligible',
          tags: ['pension', 'social security', 'old age support']
        },
        {
          id: 'farming-help-poor-villages',
          name: 'Farming Help in Poor Villages',
          category: 'Rural Development',
          schemeActualName: 'Krishi Kalyan Abhiyan',
          eligibility: 'Small farmers in poor areas',
          whatTheyGet: 'Seeds, tools, training',
          details: 'Free inputs and training in far-found districts.',
          linkToApply: 'https://krishi.gov.in/document/755',
          eligibilityStatus: 'partially-eligible',
          tags: ['rural development', 'poor areas', 'farming inputs']
        },
        {
          id: 'soil-health-card',
          name: 'Soil Health Card Scheme',
          category: 'Soil Health',
          schemeActualName: 'Soil Health Card Scheme',
          eligibility: 'All farmers',
          whatTheyGet: 'Soil report and fertilizer advice',
          details: 'Helps farmers know what nutrients their field.',
          linkToApply: 'https://soilhealth.dac.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['soil health', 'fertilizer advice', 'crop nutrition']
        },
        {
          id: 'bamboo-farming-help',
          name: 'Bamboo Farming Help',
          category: 'Specialty Farming',
          schemeActualName: 'National Bamboo Mission Green Revolution - Krishonnati Yojana',
          eligibility: 'Farmers and entrepreneurs',
          whatTheyGet: 'Support for bamboo farming',
          details: 'Grow and sell bamboo with government help.',
          linkToApply: 'https://nbm.nic.in/',
          eligibilityStatus: 'not-eligible',
          tags: ['bamboo farming', 'specialty crops', 'green revolution']
        },
        {
          id: 'business-help-young-farmers',
          name: 'Business Help for Young Farmers',
          category: 'Entrepreneurship',
          schemeActualName: 'Yuva Sahakar Scheme',
          eligibility: 'Youth (18-35) in cooperatives',
          whatTheyGet: 'Loans to start agri business',
          details: 'Helps young start dairy, poultry, and agi units.',
          linkToApply: 'https://www.ncdc.in/Grindex.aspx',
          eligibilityStatus: 'partially-eligible',
          tags: ['young farmers', 'agribusiness', 'cooperatives']
        },
        {
          id: 'assured-price-crops',
          name: 'Assured Price for Crops',
          category: 'Price Support',
          schemeActualName: 'PM Aruddha Aay Sanrakshan Abhiyan',
          eligibility: 'Farmers of selected crops',
          whatTheyGet: 'Support when market price is low',
          details: 'Govt. pays price difference to farmers.',
          linkToApply: 'https://agricoop.gov.in/en/PM-AASHA',
          eligibilityStatus: 'eligible',
          tags: ['price support', 'minimum support price', 'market protection']
        },
        {
          id: 'organic-farming-help',
          name: 'Organic Farming Help',
          category: 'Organic Farming',
          schemeActualName: 'Paramparagat Krishi Vikas Yojana',
          eligibility: 'Farmer clusters',
          whatTheyGet: '₹50,000/hectare',
          details: 'Support for chemical-free natural farming.',
          linkToApply: 'https://pgsindia-ncof.gov.in/pkvy/index.aspx',
          eligibilityStatus: 'partially-eligible',
          tags: ['organic farming', 'chemical-free', 'natural farming']
        },
        {
          id: 'help-growing-grains',
          name: 'Help for Growing Grains',
          category: 'Food Security',
          schemeActualName: 'National Food Security Mission',
          eligibility: 'All farmers',
          whatTheyGet: 'Seeds, tools, training',
          details: 'Support for rice, wheat, and pulse growers.',
          linkToApply: 'https://nfsm.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['food security', 'grains', 'seeds and tools']
        },
        {
          id: 'agriculture-education-support',
          name: 'Agriculture Education Support',
          category: 'Education',
          schemeActualName: 'Unnat Krishi Shiksha Yojana',
          eligibility: 'Students, institutions',
          whatTheyGet: 'Support for agri studies',
          details: 'Scholarships and support for students in agri field.',
          linkToApply: 'https://education.kar.nic.in/krishi/',
          eligibilityStatus: 'not-eligible',
          tags: ['education', 'scholarships', 'agricultural studies']
        },
        {
          id: 'local-cow-breed-support',
          name: 'Local Cow Breed Support',
          category: 'Livestock',
          schemeActualName: 'Rashtriya Gokul Mission',
          eligibility: 'Cattle owners',
          whatTheyGet: 'Support for desi cows',
          details: 'Improve milk yield and native breeds.',
          linkToApply: 'https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission',
          eligibilityStatus: 'partially-eligible',
          tags: ['livestock', 'desi cows', 'milk production']
        },
        {
          id: 'fish-pond-help',
          name: 'Fish Pond Help',
          category: 'Fisheries',
          schemeActualName: 'Mission Aqua Sarover',
          eligibility: 'Rural farmers',
          whatTheyGet: 'Help to dig ponds',
          details: 'Save water for farming and fish one.',
          linkToApply: 'https://pmrit.krishi.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['fisheries', 'pond construction', 'aquaculture']
        },
        {
          id: 'bee-farming-support',
          name: 'Bee Farming Support',
          category: 'Beekeeping',
          schemeActualName: 'National Beekeeping and Honey Mission Mission',
          eligibility: 'Farmers, beekeepers',
          whatTheyGet: 'Support for honey production',
          details: 'Tools, training for beekeeping.',
          linkToApply: 'https://nbhm.gov.in/',
          eligibilityStatus: 'eligible',
          tags: ['beekeeping', 'honey production', 'tools and training']
        },
        {
          id: 'oil-palm-farming-help',
          name: 'Oil Palm Farming Help',
          category: 'Cash Crops',
          schemeActualName: 'National Mission on Edible Oils - Oil Palm',
          eligibility: 'Oilseed farmers',
          whatTheyGet: 'Help to grow oil palm',
          details: 'Support for palm oil tree farming.',
          linkToApply: 'https://nmeo-oilpalm.dac.gov.in/',
          eligibilityStatus: 'not-eligible',
          tags: ['oil palm', 'cash crops', 'oilseed farming']
        },
        {
          id: 'full-farming-improvement-support',
          name: 'Full Farming Improvement Support',
          category: 'Comprehensive Support',
          schemeActualName: 'Green Revolution - Krishonnati Yojana',
          eligibility: 'All farmers',
          whatTheyGet: 'Support for seeds, tools, training',
          details: 'Includes multiple schemes for overall growth.',
          linkToApply: 'https://agricoop.gov.in/en/schemes',
          eligibilityStatus: 'eligible',
          tags: ['comprehensive support', 'seeds', 'tools', 'training', 'overall growth']
        }
      ];

      res.json(insuranceOptions);
    } catch (error) {
      console.error("Insurance options fetch error:", error);
      res.status(500).json({ message: "Failed to fetch insurance options" });
    }
  });

  app.patch('/api/insurance-applications/:id/status', async (req, res) => {
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

  // Warehouse routes
  app.get('/api/warehouses', async (req, res) => {
    try {
      const warehouses = await storage.getAvailableWarehouses();
      res.json(warehouses);
    } catch (error) {
      console.error("Warehouses fetch error:", error);
      res.status(500).json({ message: "Failed to fetch warehouses" });
    }
  });

  app.get('/api/warehouses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const warehouse = await storage.getWarehouseById(id);
      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (error) {
      console.error("Warehouse fetch error:", error);
      res.status(500).json({ message: "Failed to fetch warehouse" });
    }
  });

  app.post('/api/warehouses', async (req, res) => {
    try {
      const warehouseData = req.body;
      const validatedData = insertWarehouseSchema.parse(warehouseData);
      const warehouse = await storage.createWarehouse(validatedData);
      res.json(warehouse);
    } catch (error) {
      console.error("Warehouse creation error:", error);
      res.status(400).json({ message: "Failed to create warehouse" });
    }
  });

  // Marketplace Product routes
  app.get('/api/marketplace/products', async (req, res) => {
    try {
      const { category, seller, search } = req.query;
      let products;
      
      if (search) {
        products = await storage.searchProducts(search as string, category as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (seller) {
        products = await storage.getProductsBySeller(seller as string);
      } else {
        products = await storage.searchProducts(''); // Get all products
      }
      
      res.json(products);
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/marketplace/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Product fetch error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get user's own products
  app.get('/api/marketplace/products/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const products = await storage.getProductsBySeller(userId);
      res.json(products);
    } catch (error) {
      console.error("User products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user products" });
    }
  });

  app.post('/api/marketplace/products', async (req: any, res) => {
    try {
      const productData = req.body;
      console.log("Creating product:", productData);
      
      // Validate the data including sellerId from the request body
      const validatedData = insertMarketplaceProductSchema.parse(productData);
      console.log("Validated data:", validatedData);
      
      const product = await storage.createProduct(validatedData);
      console.log("Product created successfully:", product);
      
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Product creation error:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: error.message || "Failed to create product" 
        });
      }
    }
  });

  // Update product (PATCH)
  app.patch('/api/marketplace/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const sellerId = req.user.claims.sub;
      
      // Verify the product belongs to the seller
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (existingProduct.sellerId !== sellerId) {
        return res.status(403).json({ message: "Unauthorized to update this product" });
      }
      
      await storage.updateProduct(id, updateData);
      res.json({ success: true });
    } catch (error) {
      console.error("Product update error:", error);
      res.status(400).json({ message: "Failed to update product", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Delete product (DELETE) - Allow for development environment
  app.delete('/api/marketplace/products/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // In development, allow deletion without strict auth checks
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Product deletion error:", error);
      res.status(400).json({ message: "Failed to delete product", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Cart routes
  app.get('/api/marketplace/cart', async (req: any, res) => {
    try {
      const { buyerId } = req.query;
      if (!buyerId) {
        return res.status(400).json({ message: "buyerId is required" });
      }
      const cartItems = await storage.getCartByUser(buyerId as string);
      res.json(cartItems);
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/marketplace/cart', async (req: any, res) => {
    try {
      const cartData = req.body;
      
      const validatedData = insertCartItemSchema.parse(cartData);
      
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(400).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/marketplace/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const buyerId = req.user.claims.sub;
      
      await storage.updateCartQuantity(buyerId, productId, quantity);
      res.json({ success: true });
    } catch (error) {
      console.error("Cart update error:", error);
      res.status(400).json({ message: "Failed to update cart" });
    }
  });

  app.put('/api/marketplace/cart/items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      await storage.updateCartItemQuantity(itemId, quantity);
      res.json({ success: true });
    } catch (error) {
      console.error("Cart item update error:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/marketplace/cart/items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const { itemId } = req.params;
      
      await storage.removeCartItem(itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Cart item remove error:", error);
      res.status(400).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete('/api/marketplace/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const buyerId = req.user.claims.sub;
      
      await storage.removeFromCart(buyerId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Cart remove error:", error);
      res.status(400).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes - Get user's orders with items and product details
  app.get('/api/marketplace/orders', async (req: any, res) => {
    try {
      const { buyerId } = req.query;
      if (!buyerId) {
        return res.status(400).json({ message: "buyerId is required" });
      }
      
      // Get orders with complete details including product and seller information
      const ordersData = await db
        .select({
          id: marketplaceOrders.id,
          totalAmount: marketplaceOrders.totalAmount,
          orderStatus: marketplaceOrders.orderStatus,
          paymentMethod: marketplaceOrders.paymentMethod,
          paymentStatus: marketplaceOrders.paymentStatus,
          shippingAddress: marketplaceOrders.shippingAddress,
          estimatedDelivery: marketplaceOrders.estimatedDelivery,
          createdAt: marketplaceOrders.createdAt,
        })
        .from(marketplaceOrders)
        .where(eq(marketplaceOrders.buyerId, buyerId as string))
        .orderBy(marketplaceOrders.createdAt);

      // Get order items with product and seller details for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const items = await db
            .select({
              id: orderItems.id,
              quantity: orderItems.quantity,
              pricePerUnit: orderItems.pricePerUnit,
              subtotal: orderItems.subtotal,
              productName: marketplaceProducts.productName,
              category: marketplaceProducts.category,
              imageUrls: marketplaceProducts.imageUrls,
              sellerName: users.name,
              sellerCity: users.city,
              sellerId: users.id,
              productId: marketplaceProducts.id,
            })
            .from(orderItems)
            .innerJoin(marketplaceProducts, eq(orderItems.productId, marketplaceProducts.id))
            .innerJoin(users, eq(orderItems.sellerId, users.id))
            .where(eq(orderItems.orderId, order.id));

          return {
            ...order,
            items: items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              pricePerUnit: item.pricePerUnit,
              subtotal: item.subtotal,
              product: {
                id: item.productId,
                productName: item.productName,
                category: item.category,
                imageUrls: item.imageUrls,
              },
              seller: {
                id: item.sellerId,
                name: item.sellerName,
                city: item.sellerCity,
              },
            })),
          };
        })
      );

      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create order from cart
  app.post('/api/marketplace/orders', async (req: any, res) => {
    try {
      const { buyerId, paymentMethod, shippingAddress } = req.body;
      
      if (!buyerId || !paymentMethod || !shippingAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get cart items for the buyer
      const cartData = await storage.getCartByUser(buyerId);
      
      if (cartData.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total amount
      const totalAmount = cartData.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
      
      // Create order
      const orderData = {
        buyerId,
        totalAmount,
        paymentMethod,
        shippingAddress,
        estimatedDelivery: "3-5 days",
        orderStatus: "pending",
        paymentStatus: "pending"
      };

      // Create order items from cart
      const orderItemsData = cartData.map(item => ({
        productId: item.productId,
        sellerId: item.sellerId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        subtotal: item.quantity * item.pricePerUnit
      }));

      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Clear cart after successful order
      await storage.clearCart(buyerId);
      
      res.json({ success: true, orderId: order.id });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Buy single product directly
  app.post('/api/marketplace/buy-now', async (req: any, res) => {
    try {
      const { buyerId, productId, quantity, paymentMethod, shippingAddress } = req.body;
      
      if (!buyerId || !productId || !quantity || !paymentMethod || !shippingAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get product details
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient quantity available" });
      }

      // Calculate total amount
      const totalAmount = product.pricePerUnit * quantity;
      
      // Create order
      const orderData = {
        buyerId,
        totalAmount,
        paymentMethod,
        shippingAddress,
        estimatedDelivery: "3-5 days",
        orderStatus: "pending",
        paymentStatus: "pending"
      };

      // Create single order item
      const orderItemsData = [{
        productId: product.id,
        sellerId: product.sellerId,
        quantity,
        pricePerUnit: product.pricePerUnit,
        subtotal: totalAmount
      }];

      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Update product quantity
      await storage.updateProductQuantity(productId, product.quantity - quantity);
      
      res.json({ success: true, orderId: order.id });
    } catch (error) {
      console.error("Direct buy error:", error);
      res.status(500).json({ message: "Failed to purchase product" });
    }
  });

  app.get('/api/marketplace/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Order fetch error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
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
