import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">GM</span>
              </div>
              <span className="text-2xl font-bold">Good Motor</span>
            </div>
            <p className="text-secondary-300 mb-4 max-w-md">
              Leading provider of industrial vacuum pumps and motor solutions. 
              Trusted by professionals worldwide for quality, reliability, and innovation.
            </p>
            <div className="text-secondary-300">
              <p>📧 info@goodmotor.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Industrial Ave, Tech City, TC 12345</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-secondary-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-secondary-300 hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/about" className="text-secondary-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-secondary-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><span className="text-secondary-300">Rotary Vane Pumps</span></li>
              <li><span className="text-secondary-300">Scroll Pumps</span></li>
              <li><span className="text-secondary-300">Diaphragm Pumps</span></li>
              <li><span className="text-secondary-300">Turbomolecular Pumps</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-700 mt-12 pt-8 text-center">
          <p className="text-secondary-300">
            © {currentYear} Good Motor. All rights reserved. | Built with Next.js & MongoDB
          </p>
        </div>
      </div>
    </footer>
  )
} 