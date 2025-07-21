#!/bin/bash

# Good Motor Website - Database Setup Script
# This script sets up the MongoDB Atlas database with seed data

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="103.72.96.189"
VPS_PORT="24700"
VPS_USER="root"
VPS_PASSWORD="(*W4dd#qao8k%iwlb)%R"
VPS_PATH="/var/www/good-motor"
APP_NAME="good-motor"

# MongoDB Atlas Configuration
MONGODB_URI="mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_vps_info() {
    echo -e "${BLUE}[VPS INFO]${NC} $1"
}

# Display VPS information
echo ""
print_vps_info "VPS Configuration:"
echo "  • Host: $VPS_HOST"
echo "  • Port: $VPS_PORT" 
echo "  • User: $VPS_USER"
echo "  • Password: $VPS_PASSWORD"
echo "  • Path: $VPS_PATH"
echo ""

print_status "🗄️ Setting up MongoDB Atlas database..."
print_status "📡 Connecting to MongoDB Atlas: $MONGODB_URI"

# Check if mongosh is installed
if ! command -v mongosh &> /dev/null; then
    print_status "📦 Installing MongoDB Shell..."
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-mongosh
fi

# Create database and collections using MongoDB Atlas connection
print_status "🏗️ Setting up database structure in MongoDB Atlas..."
mongosh "$MONGODB_URI" << EOF
// Create products collection
db.products.drop();

// Insert sample products
db.products.insertMany([
  {
    name: "Rotary Vane Pump RV-2000",
    slug: "rotary-vane-pump-rv-2000",
    category: "rotary-vane",
    price: 15000,
    image: "/images/products/rotary-vane-pump.jpg",
    description: "High-performance rotary vane pump ideal for industrial applications requiring consistent vacuum levels.",
    specifications: {
      "flowRate": "2000 CFM",
      "vacuumLevel": "0.1 torr",
      "power": "15 HP",
      "inletSize": "8 inches",
      "weight": "450 lbs"
    },
    features: [
      "Oil-sealed design for superior vacuum",
      "Heavy-duty construction for continuous operation",
      "Low noise operation",
      "Easy maintenance and service",
      "Corrosion-resistant materials"
    ],
    applications: [
      "Industrial manufacturing",
      "Chemical processing",
      "Packaging machinery",
      "Material handling"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Scroll Pump SC-1500",
    slug: "scroll-pump-sc-1500",
    category: "scroll",
    price: 18000,
    image: "/images/products/scroll-pump.jpg",
    description: "Oil-free scroll pump providing clean vacuum for sensitive applications without contamination risk.",
    specifications: {
      "flowRate": "1500 CFM",
      "vacuumLevel": "0.05 torr",
      "power": "12 HP",
      "inletSize": "6 inches",
      "weight": "380 lbs"
    },
    features: [
      "Oil-free operation for contamination-free vacuum",
      "Quiet operation suitable for laboratory environments",
      "Compact design saves floor space",
      "Minimal maintenance requirements",
      "Digital control panel with diagnostics"
    ],
    applications: [
      "Pharmaceutical manufacturing",
      "Laboratory applications",
      "Clean room environments",
      "Food processing"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Diaphragm Pump DP-800",
    slug: "diaphragm-pump-dp-800",
    category: "diaphragm", 
    price: 12000,
    image: "/images/products/diaphragm-pump.jpg",
    description: "Chemical-resistant diaphragm pump perfect for corrosive gas handling and contamination-free operation.",
    specifications: {
      "flowRate": "800 CFM",
      "vacuumLevel": "0.2 torr",
      "power": "8 HP",
      "inletSize": "4 inches",
      "weight": "250 lbs"
    },
    features: [
      "PTFE-lined chamber for chemical resistance",
      "Dry operation without oil contamination",
      "Handles condensable vapors",
      "Automatic restart after power failure",
      "Self-draining design"
    ],
    applications: [
      "Chemical processing",
      "Solvent recovery",
      "Vapor handling",
      "Corrosive gas applications"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Turbomolecular Pump TM-500",
    slug: "turbomolecular-pump-tm-500",
    category: "turbomolecular",
    price: 25000,
    image: "/images/products/turbomolecular-pump.jpg",
    description: "High-vacuum turbomolecular pump for ultra-high vacuum applications. Essential for semiconductor manufacturing and research facilities.",
    specifications: {
      "flowRate": "500 L/s",
      "vacuumLevel": "10^-9 torr",
      "power": "2 HP",
      "inletSize": "6 inches ISO-K",
      "weight": "85 lbs"
    },
    features: [
      "Ultra-high vacuum capability",
      "Magnetic bearing technology",
      "Compact vertical design",
      "Integrated controller",
      "Remote monitoring capability"
    ],
    applications: [
      "Semiconductor manufacturing",
      "Research laboratories",
      "Surface analysis",
      "Mass spectrometry"
    ],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "slug": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });

// Show inserted products
print("✅ Database setup completed!");
print("📊 Total products inserted: " + db.products.countDocuments());
EOF

print_status "✅ MongoDB Atlas database setup completed!"
print_status "📈 Database is ready for the application" 