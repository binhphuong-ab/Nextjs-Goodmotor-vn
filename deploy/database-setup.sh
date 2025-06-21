#!/bin/bash

# Good Motor Website - Database Setup Script
# This script sets up MongoDB and seeds the database

echo "🗄️ Setting up MongoDB database..."

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

echo "📊 Checking MongoDB status..."
sudo systemctl status mongod --no-pager

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Create database and collections
echo "🏗️ Setting up database structure..."
mongosh goodmotor << EOF
// Create products collection
db.products.drop();

// Insert sample products
db.products.insertMany([
  {
    name: "Rotary Vane Pump RV-2000",
    model: "RV-2000",
    category: "rotary-vane",
    price: 15000,
    image: "/images/rotary-vane-pump.jpg",
    description: "High-performance rotary vane pump ideal for industrial applications requiring consistent vacuum levels.",
    specifications: {
      "Pumping Speed": "2000 CFM",
      "Ultimate Vacuum": "0.1 mbar",
      "Motor Power": "15 kW",
      "Inlet Size": "DN 100",
      "Weight": "250 kg"
    },
    features: [
      "Oil-sealed design for superior performance",
      "Robust construction for continuous operation",
      "Low noise operation",
      "Easy maintenance access"
    ],
    applications: [
      "Packaging industry",
      "Chemical processing",
      "Laboratory applications",
      "Heat treatment processes"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Scroll Pump SC-1500",
    model: "SC-1500", 
    category: "scroll",
    price: 18000,
    image: "/images/scroll-pump.jpg",
    description: "Oil-free scroll pump providing clean vacuum for sensitive applications without contamination risk.",
    specifications: {
      "Pumping Speed": "1500 CFM",
      "Ultimate Vacuum": "0.01 mbar",
      "Motor Power": "12 kW",
      "Inlet Size": "DN 80",
      "Weight": "180 kg"
    },
    features: [
      "100% oil-free operation",
      "Low vibration design",
      "Minimal maintenance required",
      "High reliability"
    ],
    applications: [
      "Semiconductor manufacturing",
      "Medical equipment",
      "Food processing",
      "Pharmaceutical production"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Diaphragm Pump DP-800",
    model: "DP-800",
    category: "diaphragm", 
    price: 12000,
    image: "/images/diaphragm-pump.jpg",
    description: "Chemical-resistant diaphragm pump perfect for corrosive gas handling and contamination-free operation.",
    specifications: {
      "Pumping Speed": "800 CFM",
      "Ultimate Vacuum": "1 mbar",
      "Motor Power": "8 kW",
      "Inlet Size": "DN 50",
      "Weight": "120 kg"
    },
    features: [
      "Chemical-resistant materials",
      "Contamination-free pumping",
      "Self-priming operation",
      "Compact design"
    ],
    applications: [
      "Chemical analysis",
      "Environmental monitoring",
      "Analytical instruments",
      "Research laboratories"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Turbomolecular Pump TM-500",
    model: "TM-500",
    category: "turbomolecular",
    price: 25000,
    image: "/images/turbomolecular-pump.jpg",
    description: "Ultra-high vacuum turbomolecular pump for demanding scientific and industrial applications.",
    specifications: {
      "Pumping Speed": "500 L/s",
      "Ultimate Vacuum": "10⁻¹⁰ mbar",
      "Motor Power": "5 kW",
      "Inlet Size": "DN 63",
      "Weight": "80 kg"
    },
    features: [
      "Ultra-high vacuum capability",
      "Fast startup time",
      "Magnetic bearing technology",
      "Remote monitoring capability"
    ],
    applications: [
      "Scientific research",
      "Electron microscopy",
      "Surface analysis",
      "Space simulation"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "name": "text", "description": "text" });

// Show inserted products
db.products.find().pretty();

print("✅ Database setup completed!");
print("📊 Total products inserted: " + db.products.countDocuments());
EOF

echo "✅ MongoDB database setup completed!"
echo "📈 Database is ready for the application" 