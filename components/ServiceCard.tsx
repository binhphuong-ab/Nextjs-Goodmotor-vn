'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

// Define the props interface for type safety
interface ServiceCardProps {
  title: string    // The service title to display
  image: string    // URL/path to the service image
  href?: string    // Optional link destination (defaults to '#')
}

/**
 * ServiceCard Component
 * 
 * This is a reusable card component that displays individual service items
 * within the carousel. Each card has:
 * - A hover-responsive image with scaling effect
 * - Service title with color transition on hover
 * - "Learn more" link with animated underline
 * - Consistent height using flexbox for uniform carousel display
 */
export default function ServiceCard({ title, image, href = '#' }: ServiceCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      {/* 
        Image Section with Hover Effects
        - Fixed height (h-52) for consistent card appearance in carousel
        - 'group' class enables group-hover effects for child elements
        - Overflow hidden contains the scaling effect
      */}
      <div className="relative h-52 w-full overflow-hidden">
        {/* Next.js optimized Image component with hover scaling */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        
        {/* 
          Overlay gradient that appears on hover
          - Creates visual depth and improves text readability
          - Transitions from transparent to visible on group hover
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* 
        Content Section
        - flex-1 makes this section expand to fill available card height
        - Ensures all cards have consistent height in carousel layout
      */}
      <div className="p-6 flex flex-col flex-1">
        {/* 
          Service Title
          - flex-1 allows title to take available space
          - Color transition on group hover (gray-800 → blue-600)
          - mb-5 provides consistent spacing before the link
        */}
        <h3 className="text-xl font-semibold text-gray-800 mb-5 flex-1 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        {/* 
          "Learn More" Link with Advanced Animations
          - Positioned at bottom of card for consistent alignment
          - Contains multiple coordinated animations:
            1. Text color change on hover
            2. Animated underline using CSS pseudo-element
            3. Arrow slide animation
        */}
        <Link 
          href={href} 
          className="text-blue-600 font-medium flex items-center transition-all duration-300 hover:text-blue-800"
        >
          {/* 
            Text with animated underline effect
            - Uses CSS pseudo-element (after:) to create growing underline
            - Starts with width 0, expands to full width on group hover
          */}
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 group-hover:after:w-full after:transition-all after:duration-300">Learn more</span>
          
          {/* 
            Arrow icon with slide animation
            - Moves right (translate-x-1) on group hover
            - Provides visual feedback for interactive element
          */}
          <ArrowRightIcon className="h-5 w-5 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  )
} 