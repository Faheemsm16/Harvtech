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
  },
  
  // Tillers
  {
    type: "tiller",
    name: "Kubota Power Tiller",
    modelNumber: "KPT-150",
    chassisNumber: "KUBPT150001",
    power: "15 HP",
    year: 2023,
    pricePerDay: 800,
    location: "Vellore",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-7"
  },
  {
    type: "tiller",
    name: "Captain Power Tiller",
    modelNumber: "CPT-120",
    chassisNumber: "CAPPT120001",
    power: "12 HP",
    year: 2022,
    pricePerDay: 650,
    location: "Dindigul",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1589995651834-92ce5ef1711a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-8"
  },
  {
    type: "tiller",
    name: "Kamco Power Tiller",
    modelNumber: "KAMPT-180",
    chassisNumber: "KAMPT180001",
    power: "18 HP",
    year: 2023,
    pricePerDay: 900,
    location: "Erode",
    availability: "available",
    imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ownerId: "sample-owner-9"
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
  },
  {
    id: "sample-owner-7",
    email: "owner7@harvtech.com",
    firstName: "Ganesh",
    lastName: "K",
    mobileNumber: "9876543216",
    role: "owner",
    farmerId: "FRM-123462",
    name: "Ganesh K",
    city: "Vellore",
    country: "India",
    aadhaarNumber: "123456789018",
    isVerified: true
  },
  {
    id: "sample-owner-8",
    email: "owner8@harvtech.com",
    firstName: "Ramesh",
    lastName: "P",
    mobileNumber: "9876543217",
    role: "owner",
    farmerId: "FRM-123463",
    name: "Ramesh P",
    city: "Dindigul",
    country: "India",
    aadhaarNumber: "123456789019",
    isVerified: true
  },
  {
    id: "sample-owner-9",
    email: "owner9@harvtech.com",
    firstName: "Suresh",
    lastName: "V",
    mobileNumber: "9876543218",
    role: "owner",
    farmerId: "FRM-123464",
    name: "Suresh V",
    city: "Erode",
    country: "India",
    aadhaarNumber: "123456789020",
    isVerified: true
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
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}