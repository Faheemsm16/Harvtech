import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertEquipmentSchema, insertBookingSchema, insertInsuranceApplicationSchema, insertTransportVehicleSchema, insertTransportBookingSchema, insertWarehouseSchema, insertMarketplaceProductSchema, insertCartItemSchema, insertMarketplaceOrderSchema } from "@shared/schema";
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

  app.post('/api/marketplace/products', isAuthenticated, async (req: any, res) => {
    try {
      const productData = req.body;
      const sellerId = req.user.claims.sub;
      
      const validatedData = insertMarketplaceProductSchema.parse({
        ...productData,
        sellerId
      });
      
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  // Cart routes
  app.get('/api/marketplace/cart', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const cartItems = await storage.getCartByUser(buyerId);
      res.json(cartItems);
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/marketplace/cart', isAuthenticated, async (req: any, res) => {
    try {
      const cartData = req.body;
      const buyerId = req.user.claims.sub;
      
      const validatedData = insertCartItemSchema.parse({
        ...cartData,
        buyerId
      });
      
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
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

  // Order routes
  app.get('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(buyerId);
      res.json(orders);
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // My Orders endpoint with detailed information
  app.get('/api/my-orders', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const orders = await storage.getOrdersWithItems(buyerId);
      res.json(orders);
    } catch (error) {
      console.error("My orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = req.body;
      const buyerId = req.user.claims.sub;
      
      const validatedOrderData = insertMarketplaceOrderSchema.parse({
        ...orderData,
        buyerId
      });
      
      // Extract order items from request
      const orderItems = orderData.items || [];
      
      const order = await storage.createOrder(validatedOrderData, orderItems);
      
      // Clear cart after successful order
      await storage.clearCart(buyerId);
      
      res.json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Failed to create order" });
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
