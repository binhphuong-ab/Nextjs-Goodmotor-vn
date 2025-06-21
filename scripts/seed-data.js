const { MongoClient } = require('mongodb');

const sampleProducts = [
  {
    name: 'Rotary Vane Pump RV-2000',
    description: 'High-efficiency rotary vane pump designed for continuous operation in demanding industrial applications. Features oil-sealed design for superior vacuum performance.',
    category: 'rotary-vane',
    specifications: {
      flowRate: '2000 CFM',
      vacuumLevel: '0.1 torr',
      power: '15 HP',
      inletSize: '8 inches',
      weight: '450 lbs',
    },
    features: [
      'Oil-sealed design for superior vacuum',
      'Heavy-duty construction for continuous operation',
      'Low noise operation',
      'Easy maintenance and service',
      'Corrosion-resistant materials',
    ],
    applications: [
      'Industrial manufacturing',
      'Chemical processing',
      'Packaging machinery',
      'Material handling',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 15000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Scroll Pump SC-1500',
    description: 'Oil-free scroll pump providing clean vacuum for sensitive applications. Ideal for laboratories, clean rooms, and pharmaceutical manufacturing.',
    category: 'scroll',
    specifications: {
      flowRate: '1500 CFM',
      vacuumLevel: '0.05 torr',
      power: '12 HP',
      inletSize: '6 inches',
      weight: '380 lbs',
    },
    features: [
      'Oil-free operation for contamination-free vacuum',
      'Quiet operation suitable for laboratory environments',
      'Compact design saves floor space',
      'Minimal maintenance requirements',
      'Digital control panel with diagnostics',
    ],
    applications: [
      'Pharmaceutical manufacturing',
      'Laboratory applications',
      'Clean room environments',
      'Food processing',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 18000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Diaphragm Pump DP-800',
    description: 'Chemical-resistant diaphragm pump designed for corrosive environments. Perfect for aggressive chemical processing and vapor recovery applications.',
    category: 'diaphragm',
    specifications: {
      flowRate: '800 CFM',
      vacuumLevel: '0.2 torr',
      power: '8 HP',
      inletSize: '4 inches',
      weight: '250 lbs',
    },
    features: [
      'PTFE-lined chamber for chemical resistance',
      'Dry operation without oil contamination',
      'Handles condensable vapors',
      'Automatic restart after power failure',
      'Self-draining design',
    ],
    applications: [
      'Chemical processing',
      'Solvent recovery',
      'Vapor handling',
      'Corrosive gas applications',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 12000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Turbomolecular Pump TM-500',
    description: 'High-vacuum turbomolecular pump for ultra-high vacuum applications. Essential for semiconductor manufacturing and research facilities.',
    category: 'turbomolecular',
    specifications: {
      flowRate: '500 L/s',
      vacuumLevel: '10^-9 torr',
      power: '2 HP',
      inletSize: '6 inches ISO-K',
      weight: '85 lbs',
    },
    features: [
      'Ultra-high vacuum capability',
      'Magnetic bearing technology',
      'Compact vertical design',
      'Integrated controller',
      'Remote monitoring capability',
    ],
    applications: [
      'Semiconductor manufacturing',
      'Research laboratories',
      'Surface analysis',
      'Mass spectrometry',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 25000,
    inStock: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    const client = new MongoClient('mongodb://localhost:27017/goodmotor');
    await client.connect();
    const db = client.db('goodmotor');
    
    console.log('Clearing existing products...');
    await db.collection('products').deleteMany({});
    
    console.log('Inserting sample products...');
    const result = await db.collection('products').insertMany(sampleProducts);
    
    console.log(`Successfully inserted ${result.insertedCount} products`);
    console.log('Seed data inserted successfully!');
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData(); 