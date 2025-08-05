import { storage } from "./storage";

const sampleEquipment = [
  // Tractors
  {
    type: "tractor",
    name: "Mahindra 575 DI",
    modelNumber: "575DI-2023",
    chassisNumber: "MAH575DI23001",
    power: "47 HP",
    year: 2023,
    pricePerDay: 1200,
    location: "Chennai",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-1"
  },
  {
    type: "tractor",
    name: "John Deere 5042 D",
    modelNumber: "5042D-2022",
    chassisNumber: "JD5042D22001",
    power: "42 HP",
    year: 2022,
    pricePerDay: 1000,
    location: "Coimbatore",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-2"
  },
  {
    type: "tractor",
    name: "Massey Ferguson 241",
    modelNumber: "MF241-2023",
    chassisNumber: "MF241D23001",
    power: "41 HP",
    year: 2023,
    pricePerDay: 950,
    location: "Madurai",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-3"
  },
  
  // Weeders
  {
    type: "weeder",
    name: "Honda Power Weeder",
    modelNumber: "HPW-200",
    chassisNumber: "HON200PW001",
    power: "5.5 HP",
    year: 2023,
    pricePerDay: 300,
    location: "Trichy",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-4"
  },
  {
    type: "weeder",
    name: "Mahindra Inter Row Weeder",
    modelNumber: "MIW-150",
    chassisNumber: "MAHIRW23001",
    power: "4.5 HP",
    year: 2022,
    pricePerDay: 250,
    location: "Salem",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-5"
  },
  {
    type: "weeder",
    name: "VST Power Weeder",
    modelNumber: "VST-PW200",
    chassisNumber: "VSTPW200001",
    power: "6 HP",
    year: 2023,
    pricePerDay: 350,
    location: "Thanjavur",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1592982736275-b8ac5b387e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-6"
  }
];

const sampleUsers = [
  {
    id: "sample-owner-1",
    email: "owner1@harvtech.com",
    firstName: "Rajesh",
    lastName: "Kumar",
    mobileNumber: "9876543210",
    role: "owner",
    farmerId: "FRM-123456",
    name: "Rajesh Kumar",
    city: "Chennai",
    country: "India",
    aadhaarNumber: "123456789012",
    isVerified: true
  },
  {
    id: "sample-owner-2",
    email: "owner2@harvtech.com",
    firstName: "Murugan",
    lastName: "S",
    mobileNumber: "9876543211",
    role: "owner",
    farmerId: "FRM-123457",
    name: "Murugan S",
    city: "Coimbatore",
    country: "India",
    aadhaarNumber: "123456789013",
    isVerified: true
  },
  {
    id: "sample-owner-3",
    email: "owner3@harvtech.com",
    firstName: "Karthik",
    lastName: "Raj",
    mobileNumber: "9876543212",
    role: "owner",
    farmerId: "FRM-123458",
    name: "Karthik Raj",
    city: "Madurai",
    country: "India",
    aadhaarNumber: "123456789014",
    isVerified: true
  },
  {
    id: "sample-owner-4",
    email: "owner4@harvtech.com",
    firstName: "Senthil",
    lastName: "Nathan",
    mobileNumber: "9876543213",
    role: "owner",
    farmerId: "FRM-123459",
    name: "Senthil Nathan",
    city: "Trichy",
    country: "India",
    aadhaarNumber: "123456789015",
    isVerified: true
  },
  {
    id: "sample-owner-5",
    email: "owner5@harvtech.com",
    firstName: "Vinod",
    lastName: "Kumar",
    mobileNumber: "9876543214",
    role: "owner",
    farmerId: "FRM-123460",
    name: "Vinod Kumar",
    city: "Salem",
    country: "India",
    aadhaarNumber: "123456789016",
    isVerified: true
  },
  {
    id: "sample-owner-6",
    email: "owner6@harvtech.com",
    firstName: "Prabu",
    lastName: "M",
    mobileNumber: "9876543215",
    role: "owner",
    farmerId: "FRM-123461",
    name: "Prabu M",
    city: "Thanjavur",
    country: "India",
    aadhaarNumber: "123456789017",
    isVerified: true
  }
];

const sampleTransportVehicles = [
  {
    vehicleType: "Mini Truck",
    vehicleName: "Tata Ace",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    pricePerKm: 15,
    capacity: "1 Ton",
    estimatedTime: "2-3 hours",
    isAvailable: true
  },
  {
    vehicleType: "Tractor Trolley",
    vehicleName: "Mahindra Trolley",
    imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    pricePerKm: 25,
    capacity: "3 Ton",
    estimatedTime: "3-4 hours",
    isAvailable: true
  },
  {
    vehicleType: "Lorry",
    vehicleName: "Ashok Leyland",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    pricePerKm: 40,
    capacity: "10 Ton",
    estimatedTime: "4-5 hours",
    isAvailable: true
  },
  {
    vehicleType: "Mini Truck",
    vehicleName: "Mahindra Bolero Pickup",
    imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    pricePerKm: 18,
    capacity: "1.5 Ton",
    estimatedTime: "2-3 hours",
    isAvailable: true
  },
  {
    vehicleType: "Tractor Trolley",
    vehicleName: "John Deere Trolley",
    imageUrl: "https://images.unsplash.com/photo-1589995651834-92ce5ef1711a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    pricePerKm: 30,
    capacity: "4 Ton",
    estimatedTime: "3-4 hours",
    isAvailable: true
  }
];

const sampleWarehouses = [
  {
    name: "Tamil Nadu Grains Storage",
    address: "No. 45, GST Road, Tambaram, Chennai, Tamil Nadu 600045",
    latitude: "12.9249",
    longitude: "80.1000",
    capacity: "500 Quintal",
    availableSpace: "350 Quintal",
    pricePerUnit: 25,
    priceUnit: "Quintal",
    contactNumber: "9876501234",
    ownerName: "K. Murugan",
    facilities: JSON.stringify(["Climate Controlled", "Security", "24/7 Access", "Loading Dock"]),
    warehouseType: "Private",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Coimbatore Agriculture Hub",
    address: "Industrial Area, Peelamedu, Coimbatore, Tamil Nadu 641004",
    latitude: "11.0168",
    longitude: "76.9558",
    capacity: "800 Quintal",
    availableSpace: "600 Quintal",
    pricePerUnit: 20,
    priceUnit: "Quintal",
    contactNumber: "9876502345",
    ownerName: "R. Krishnan",
    facilities: JSON.stringify(["Pest Control", "Quality Testing", "Security", "Temperature Control"]),
    warehouseType: "Cooperative",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Government Grain Storage Facility",
    address: "FCI Godown, Near Railway Station, Madurai, Tamil Nadu 625001",
    latitude: "9.9252",
    longitude: "78.1198",
    capacity: "1200 Quintal",
    availableSpace: "800 Quintal",
    pricePerUnit: 15,
    priceUnit: "Quintal",
    contactNumber: "9876503456",
    ownerName: "Food Corporation of India",
    facilities: JSON.stringify(["Government Certified", "Insurance", "Quality Assurance", "Weighing Scale"]),
    warehouseType: "Government",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Salem Storage Solutions",
    address: "SIPCOT Industrial Complex, Salem, Tamil Nadu 636308",
    latitude: "11.6643",
    longitude: "78.1460",
    capacity: "300 Quintal",
    availableSpace: "150 Quintal",
    pricePerUnit: 30,
    priceUnit: "Quintal",
    contactNumber: "9876504567",
    ownerName: "S. Rajesh",
    facilities: JSON.stringify(["Quick Access", "Vehicle Parking", "Security"]),
    warehouseType: "Private",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Thanjavur Rice Storage",
    address: "Rice Mill Road, Thanjavur, Tamil Nadu 613001",
    latitude: "10.7870",
    longitude: "79.1378",
    capacity: "600 Quintal",
    availableSpace: "400 Quintal",
    pricePerUnit: 22,
    priceUnit: "Quintal",
    contactNumber: "9876505678",
    ownerName: "P. Venkatesh",
    facilities: JSON.stringify(["Rice Specialist", "Moisture Control", "Traditional Storage"]),
    warehouseType: "Cooperative",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Trichy Modern Storage",
    address: "Bypass Road, Srirangam, Trichy, Tamil Nadu 620006",
    latitude: "10.8505",
    longitude: "78.6950",
    capacity: "400 Quintal",
    availableSpace: "250 Quintal",
    pricePerUnit: 28,
    priceUnit: "Quintal",
    contactNumber: "9876506789",
    ownerName: "A. Selvam",
    facilities: JSON.stringify(["Modern Equipment", "Digital Monitoring", "Pest Free"]),
    warehouseType: "Private",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Vellore Agricultural Warehouse",
    address: "Katpadi Road, Vellore, Tamil Nadu 632014",
    latitude: "12.9165",
    longitude: "79.1325",
    capacity: "700 Quintal",
    availableSpace: "500 Quintal",
    pricePerUnit: 24,
    priceUnit: "Quintal",
    contactNumber: "9876507890",
    ownerName: "D. Kumar",
    facilities: JSON.stringify(["Large Capacity", "Good Connectivity", "Loading Facilities"]),
    warehouseType: "Private",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1592982736275-b8ac5b387e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Erode Commodity Storage",
    address: "Perundurai Road, Erode, Tamil Nadu 638052",
    latitude: "11.3410",
    longitude: "77.7172",
    capacity: "900 Quintal",
    availableSpace: "700 Quintal",
    pricePerUnit: 18,
    priceUnit: "Quintal",
    contactNumber: "9876508901",
    ownerName: "M. Balamurugan",
    facilities: JSON.stringify(["Multi-Commodity", "Export Ready", "Quality Certification"]),
    warehouseType: "Cooperative",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  }
];

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
  {
    sellerId: "sample-owner-4",
    category: "seeds",
    productName: "Wheat Seeds (HD 2967)",
    productDescription: "High yielding wheat variety suitable for irrigated conditions. Disease resistant.",
    quantity: 200,
    quantityUnit: "KG",
    pricePerUnit: 45,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
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
  {
    sellerId: "sample-owner-6",
    category: "fertilizers",
    productName: "Urea Fertilizer",
    productDescription: "High grade urea fertilizer with 46% nitrogen content. Suitable for all cereal crops.",
    quantity: 50,
    quantityUnit: "KG",
    pricePerUnit: 28,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  },
  {
    sellerId: "sample-owner-7",
    category: "fertilizers",
    productName: "Vermicompost",
    productDescription: "Premium quality vermicompost rich in nutrients. Improves soil structure and water retention.",
    quantity: 80,
    quantityUnit: "KG",
    pricePerUnit: 45,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1592982736275-b8ac5b387e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
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
  {
    sellerId: "sample-owner-8",
    category: "pesticides",
    productName: "Bt Cotton Spray",
    productDescription: "Biological pesticide for cotton bollworm control. Eco-friendly and effective.",
    quantity: 15,
    quantityUnit: "Liter",
    pricePerUnit: 320,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1589995651834-92ce5ef1711a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  },
  {
    sellerId: "sample-owner-9",
    category: "pesticides",
    productName: "Fungicide (Copper Based)",
    productDescription: "Copper based fungicide for fruit and vegetable crops. Controls bacterial and fungal diseases.",
    quantity: 25,
    quantityUnit: "KG",
    pricePerUnit: 180,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
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
  {
    sellerId: "sample-owner-4",
    category: "equipments",
    productName: "Sprayer Pump (Manual)",
    productDescription: "High pressure manual sprayer for pesticide and fertilizer application. 16 liter capacity.",
    quantity: 10,
    quantityUnit: "Piece",
    pricePerUnit: 1800,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  },
  {
    sellerId: "sample-owner-5",
    category: "equipments",
    productName: "Irrigation Pipes (PVC)",
    productDescription: "High quality PVC pipes for drip irrigation systems. 16mm diameter, UV resistant.",
    quantity: 500,
    quantityUnit: "Meter",
    pricePerUnit: 25,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
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
  },
  {
    sellerId: "sample-owner-7",
    category: "others",
    productName: "Garden Tools Set",
    productDescription: "Complete set of garden tools including spade, hoe, rake, and pruning shears.",
    quantity: 15,
    quantityUnit: "Set",
    pricePerUnit: 850,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  },
  {
    sellerId: "sample-owner-8",
    category: "others",
    productName: "Greenhouse Net (50%)",
    productDescription: "Shade net with 50% shade factor. Protects crops from excessive heat and UV radiation.",
    quantity: 200,
    quantityUnit: "Square Meter",
    pricePerUnit: 18,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  },
  {
    sellerId: "sample-owner-9",
    category: "others",
    productName: "Water Storage Tank (1000L)",
    productDescription: "Food grade plastic water storage tank. UV resistant and suitable for agriculture use.",
    quantity: 8,
    quantityUnit: "Piece",
    pricePerUnit: 3500,
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1592982736275-b8ac5b387e37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"]),
    isAvailable: true,
  }
];

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Create sample users first
    for (const user of sampleUsers) {
      await storage.createUser(user);
      console.log(`Created user: ${user.name}`);
    }
    
    // Create sample equipment
    for (const equipment of sampleEquipment) {
      await storage.createEquipment(equipment);
      console.log(`Created equipment: ${equipment.name}`);
    }
    
    // Create sample transport vehicles
    for (const vehicle of sampleTransportVehicles) {
      await storage.createTransportVehicle(vehicle);
      console.log(`Created transport vehicle: ${vehicle.vehicleName}`);
    }
    
    // Create sample warehouses
    for (const warehouse of sampleWarehouses) {
      await storage.createWarehouse(warehouse);
      console.log(`Created warehouse: ${warehouse.name}`);
    }
    
    // Create sample marketplace products
    for (const product of sampleMarketplaceProducts) {
      await storage.createProduct(product);
      console.log(`Created marketplace product: ${product.productName}`);
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}