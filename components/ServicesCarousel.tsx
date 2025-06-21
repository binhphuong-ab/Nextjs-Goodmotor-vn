'use client'

import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ServiceCard from '@/components/ServiceCard'
import { useState, useCallback } from 'react'

// Interface for individual service items that will be displayed in carousel
interface ServiceItem {
  title: string    // Service title
  image: string    // Image URL/path
  href?: string    // Optional link destination
}

// Props interface for the main carousel component
interface ServicesCarouselProps {
  items: ServiceItem[]  // Array of service items to display
}

/**
 * Responsive Configuration for react-multi-carousel
 * 
 * This object defines how many items to show at different screen sizes:
 * - Desktop (1024px+): Shows 3 items side by side
 * - Tablet (640px-1024px): Shows 2 items side by side  
 * - Mobile (0-640px): Shows 1 item at a time
 * 
 * slidesToSlide: 1 means carousel moves one item at a time
 */
const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
}

/**
 * Custom Navigation Buttons Component
 * 
 * This replaces the default carousel arrows with custom styled buttons.
 * Features:
 * - Uses Heroicons for consistent styling
 * - Positioned absolutely outside the carousel flow
 * - Disabled state styling when at first/last slide
 * - Smooth hover effects with shadow and background changes
 * 
 * @param carouselState - Current state from react-multi-carousel
 * @param next - Function to go to next slide
 * @param previous - Function to go to previous slide
 */
const CustomButtons = ({ carouselState, next, previous }: any) => {
  const { currentSlide, totalItems, slidesToShow } = carouselState || { currentSlide: 0, totalItems: 0, slidesToShow: 3 };
  
  // Calculate if we're at the last possible slide
  const isLastSlide = currentSlide + slidesToShow >= totalItems;
  
  return (
    <div className="flex space-x-3">
      {/* Previous Button */}
      <button
        onClick={previous}
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-0 transition-all duration-300 ${
          currentSlide === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
        aria-label="Previous"
        disabled={currentSlide === 0}
      >
        <ChevronLeftIcon className="h-6 w-6 text-blue-600" />
      </button>
      
      {/* Next Button */}
      <button
        onClick={next}
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-0 transition-all duration-300 ${
          isLastSlide ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
        aria-label="Next"
        disabled={isLastSlide}
      >
        <ChevronRightIcon className="h-6 w-6 text-blue-600" />
      </button>
    </div>
  );
};

/**
 * Custom Dot Indicator Component
 * 
 * Creates custom pagination dots that replace the default carousel indicators.
 * Features:
 * - Small circular indicators
 * - Active state with larger size and darker color
 * - Smooth transitions between states
 * - Accessible with proper ARIA labels
 * 
 * @param onClick - Function to navigate to specific slide
 * @param active - Boolean indicating if this dot represents current slide
 * @param index - Index of the slide this dot represents
 */
const CustomDot = ({ onClick, active, index }: any) => {
  return (
    <button
      className={`w-2.5 h-2.5 mx-1 rounded-full transition-all duration-300 ${
        active ? 'bg-blue-700 scale-125' : 'bg-gray-300 hover:bg-gray-400'
      }`}
      onClick={onClick}
      aria-label={`Go to slide ${index + 1}`}
    />
  );
};

/**
 * ServicesCarousel Main Component
 * 
 * This component creates a responsive, interactive carousel for displaying service cards.
 * 
 * Key Features:
 * 1. **Responsive Design**: Adapts to show 1-3 items based on screen size
 * 2. **Custom Controls**: Custom-styled navigation buttons and dot indicators
 * 3. **Auto-play**: Automatically advances slides every 5 seconds
 * 4. **Infinite Loop**: Seamlessly loops back to beginning after last slide
 * 5. **Touch/Swipe Support**: Works on mobile devices with touch gestures
 * 6. **Accessibility**: Proper ARIA labels and keyboard navigation
 * 
 * Technical Implementation:
 * - Uses react-multi-carousel library for core functionality
 * - ServiceCard components are rendered as individual carousel items
 * - Custom buttons positioned absolutely to avoid layout conflicts
 * - State management for tracking current slide position
 * 
 * @param items - Array of ServiceItem objects to display in carousel
 */
export default function ServicesCarousel({ items }: ServicesCarouselProps) {
  // Track current slide for custom button state management
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Callback to update current slide state when carousel changes
  const handleBeforeChange = useCallback((nextSlide: number) => {
    setCurrentSlide(nextSlide);
  }, []);

  return (
    <div className="relative">
      {/* 
        Main Carousel Container
        - pb-16: Adds bottom padding to accommodate navigation buttons
        - Wraps the entire carousel in a positioned container
      */}
      <div className="pb-16">
        <Carousel
          responsive={responsive}                    // Responsive breakpoint configuration
          infinite                                   // Enable infinite loop
          arrows={false}                            // Disable default arrows (we use custom ones)
          beforeChange={handleBeforeChange}         // Callback for slide changes
          showDots                                  // Enable dot indicators
          customDot={<CustomDot />}                // Use our custom dot component
          dotListClass="flex justify-center space-x-1 mt-8"  // Style the dot container
          containerClass="pb-0"                     // Remove default bottom padding
          itemClass="px-3"                         // Add horizontal padding to each item
          autoPlay                                  // Enable auto-advance
          autoPlaySpeed={5000}                     // Auto-advance every 5 seconds
          renderDotsOutside                        // Render dots outside carousel area
          swipeable                                // Enable touch/swipe gestures
          draggable                                // Enable mouse drag on desktop
        >
          {/* 
            Render ServiceCard for each item
            - Each ServiceCard becomes a carousel slide
            - ServiceCard handles individual hover effects and styling
            - Consistent height maintained across all cards
          */}
          {items.map((item, idx) => (
            <ServiceCard key={idx} title={item.title} image={item.image} href={item.href} />
          ))}
        </Carousel>
      </div>
      
      {/* 
        Custom Navigation Buttons
        - Positioned absolutely to avoid interfering with carousel layout
        - Located at bottom-right of carousel container
        - Buttons are functional but positioned outside carousel's internal structure
        - Uses DOM manipulation to trigger carousel's internal navigation
      */}
      <div className="absolute right-0 bottom-0">
        <CustomButtons 
          carouselState={{ currentSlide, totalItems: items.length }} 
          next={() => {
            // Find and trigger the carousel's built-in next button
            const carousel = document.querySelector('.react-multi-carousel-list');
            if (carousel) {
              const nextButton = carousel.querySelector('.react-multiple-carousel__arrow--right');
              if (nextButton) {
                (nextButton as HTMLElement).click();
              }
            }
          }}
          previous={() => {
            // Find and trigger the carousel's built-in previous button
            const carousel = document.querySelector('.react-multi-carousel-list');
            if (carousel) {
              const prevButton = carousel.querySelector('.react-multiple-carousel__arrow--left');
              if (prevButton) {
                (prevButton as HTMLElement).click();
              }
            }
          }}
        />
      </div>
    </div>
  );
} 