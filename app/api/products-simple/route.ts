import { NextResponse } from 'next/server'

// Simple mock data for testing
const mockProducts = [
  {
    _id: '1',
    name: 'Rotary Vane Pump RV-2000',
    description: 'High-efficiency rotary vane pump designed for continuous operation in demanding industrial applications.',
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
    ],
    applications: [
      'Industrial manufacturing',
      'Chemical processing',
      'Packaging machinery',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 15000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Scroll Pump SC-1500',
    description: 'Oil-free scroll pump providing clean vacuum for sensitive applications.',
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
    ],
    applications: [
      'Pharmaceutical manufacturing',
      'Laboratory applications',
      'Clean room environments',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 18000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export async function GET() {
  try {
    return NextResponse.json({ products: mockProducts })
  } catch (error) {
    console.error('Error in simple products API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 