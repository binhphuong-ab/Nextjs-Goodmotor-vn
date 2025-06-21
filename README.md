# Good Motor - Industrial Vacuum Pumps Website

A modern, responsive website for Good Motor, showcasing industrial vacuum pumps and company profile. Built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## 🚀 Features

- **Modern Design**: Clean, professional design with responsive layout
- **Product Catalog**: Comprehensive vacuum pump product showcase with filtering
- **Company Profile**: Detailed about page with company history and team
- **Contact System**: Functional contact form with MongoDB integration
- **TypeScript**: Full type safety throughout the application
- **API Routes**: RESTful API endpoints for products and contact forms
- **Database Integration**: MongoDB with proper data models
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB with native driver
- **Icons**: Heroicons React
- **Animations**: Framer Motion (optional)
- **Images**: Next.js Image component with Unsplash integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd good-motor-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/goodmotor
   
   # Application Settings
   NEXT_PUBLIC_APP_NAME=Good Motor
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local` file
   - The database and collections will be created automatically

5. **Seed sample data (optional)**
   ```bash
   npx ts-node scripts/seed-data.ts
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
good-motor-website/
├── app/                    # Next.js App Router directory
│   ├── api/               # API routes
│   │   ├── contact/       # Contact form endpoint
│   │   └── products/      # Products CRUD endpoints
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── products/          # Products listing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Footer.tsx         # Footer component
│   └── Navbar.tsx         # Navigation component
├── lib/                   # Utility functions
│   └── mongodb.ts         # MongoDB connection utility
├── models/                # TypeScript interfaces
│   ├── Contact.ts         # Contact form data model
│   └── Product.ts         # Product data model
├── scripts/               # Utility scripts
│   └── seed-data.ts       # Database seeding script
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## 📄 Pages Overview

### Homepage (`/`)
- Hero section with company introduction
- Features showcase highlighting key benefits
- Featured products grid
- Call-to-action sections

### Products (`/products`)
- Complete product catalog with filtering by category
- Detailed product specifications and features
- Stock status indicators
- Quote request functionality

### About (`/about`)
- Company history and milestones
- Leadership team profiles
- Company values and mission
- Statistical highlights

### Contact (`/contact`)
- Contact information and business hours
- Interactive contact form with validation
- Form submissions saved to MongoDB
- Success/error feedback

## 🗃 Database Schema

### Products Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  category: 'rotary-vane' | 'scroll' | 'diaphragm' | 'turbomolecular' | 'other',
  specifications: {
    flowRate: string,
    vacuumLevel: string,
    power: string,
    inletSize: string,
    weight: string
  },
  features: string[],
  applications: string[],
  image: string,
  price?: number,
  inStock: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Contacts Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone?: string,
  company?: string,
  subject: string,
  message: string,
  inquiryType: 'quote' | 'support' | 'general' | 'product-info',
  status: 'new' | 'in-progress' | 'resolved' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Design System

The project uses a custom design system built with Tailwind CSS:

- **Primary Colors**: Blue shades for branding and CTAs
- **Secondary Colors**: Gray shades for text and backgrounds
- **Typography**: Inter font family with responsive sizing
- **Components**: Reusable button and layout classes
- **Responsive**: Mobile-first approach with breakpoints

## 🔧 API Endpoints

### Products
- `GET /api/products` - Fetch all products (with optional category filter)
- `POST /api/products` - Create new product

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Fetch all contact submissions (admin)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform that supports Node.js applications:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Adding New Products
1. Use the seed script to add sample data
2. Use the POST API endpoint to add products programmatically
3. Consider building an admin interface for content management

### Customization
- Modify colors in `tailwind.config.js`
- Update company information in components
- Add new product categories in the Product model
- Extend contact form fields as needed

## 🧪 Testing

To run the application in development:
```bash
npm run dev
```

For production build:
```bash
npm run build
npm start
```

## 📝 License

This project is for educational/demonstration purposes. Good Motor is a fictional company created for this example.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions about this implementation:
- Check the documentation above
- Review the code comments
- Open an issue for bugs or feature requests 