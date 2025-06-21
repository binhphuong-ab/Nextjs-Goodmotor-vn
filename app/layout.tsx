// Next.js helper type for defining route metadata
import type { Metadata } from 'next'

// Google Font utility from Next.js 13+ for self-hosting/optimised font loading
import { Inter } from 'next/font/google'

// Global stylesheet that applies Tailwind base/reset and custom utilities
import './globals.css'

// Shared UI components rendered on every page
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Load the Inter font with latin subset; Next.js will automatically include the
// correct <link preload> tags in the document head and generate a CSS class
const inter = Inter({ subsets: ['latin'] })

// Page-level metadata that will be injected into <head> for all routes under
// this layout. Helps SEO and social sharing.
export const metadata: Metadata = {
  title: 'Good Motor - Industrial Vacuum Pumps & Solutions',
  description: 'Leading provider of high-quality vacuum pumps and industrial solutions. Trusted by professionals worldwide.',
  keywords: 'vacuum pumps, industrial equipment, motor solutions',
}

export default function RootLayout({
  // `children` is the currently rendered page (Server Component) that will be
  // wrapped by this layout. Every route inside the `app/` directory inherits
  // this structure.
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Apply the Inter font to the entire document via generated className */}
      <body className={inter.className}>
        {/* Persistent navigation bar shown on all pages */}
        <Navbar />
        {/* Main content area; min-h-screen ensures full viewport height */}
        <main className="min-h-screen">
          {children}
        </main>
        {/* Persistent footer */}
        <Footer />
      </body>
    </html>
  )
} 