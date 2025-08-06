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
    name: "Tiruchirappalli Crop Storage",
    address: "Thillai Nagar, Tiruchirappalli, Tamil Nadu 620018",
    latitude: "10.7905",
    longitude: "78.7047",
    capacity: "600 Quintal",
    availableSpace: "400 Quintal",
    pricePerUnit: 22,
    priceUnit: "Quintal",
    contactNumber: "9876505678",
    ownerName: "M. Anand",
    facilities: JSON.stringify(["Humidity Control", "Fire Safety", "CCTV Monitoring"]),
    warehouseType: "Private",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Vellore Agricultural Warehouse",
    address: "Katpadi Road, Vellore, Tamil Nadu 632006",
    latitude: "12.9165",
    longitude: "79.1325",
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
  }
];

async function seedWarehouses() {
  for (const warehouse of sampleWarehouses) {
    try {
      const response = await fetch('http://localhost:5000/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouse)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Created warehouse: ${warehouse.name}`);
      } else {
        console.log(`✗ Failed to create warehouse: ${warehouse.name}`);
      }
    } catch (error) {
      console.log(`✗ Error creating warehouse ${warehouse.name}:`, error.message);
    }
  }
}

seedWarehouses().then(() => {
  console.log('Warehouse seeding completed!');
});