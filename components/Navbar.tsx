'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // Function to check if a navigation item is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Applications', href: '/applications' },
    { name: 'Projects', href: '/projects' },
    { name: 'Customers', href: '/customers' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Admin', href: '/admin' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">GM</span>
            </div>
            <span className="text-2xl font-bold text-secondary-900">Good Motor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-all duration-300 ease-in-out transform relative group px-4 py-2 rounded-lg ${
                  isActiveLink(item.href)
                    ? 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-600/30 scale-105'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50 hover:shadow-md hover:scale-105'
                }`}
              >
                {item.name}
                {/* Rounded rectangle glow effect */}
                {isActiveLink(item.href) && (
                  <span 
                    className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg blur-sm opacity-50 -z-10 animate-pulse"
                  />
                )}
              </Link>
            ))}

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
            >
              <div className="transition-transform duration-200 ease-in-out">
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                ) : (
                  <Bars3Icon className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-secondary-50 rounded-lg mb-4 transform transition-all duration-300 ease-in-out">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 font-medium transition-all duration-300 ease-in-out rounded-md transform relative overflow-hidden ${
                    isActiveLink(item.href)
                      ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600 scale-105 shadow-sm'
                      : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-25 hover:scale-102 hover:shadow-sm hover:border-l-2 hover:border-primary-300'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                  {/* Subtle slide-in effect for active state */}
                  <span 
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 transform transition-all duration-300 ease-in-out ${
                      isActiveLink(item.href) 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-full opacity-0'
                    }`}
                  />
                </Link>
              ))}

            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 