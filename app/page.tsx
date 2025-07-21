// NEXT.JS IMPORTS
// Link component provides client-side navigation between pages (faster than <a> tags)
import Link from 'next/link'
// Image component provides automatic optimization, lazy loading, and responsive images
import Image from 'next/image'

// LUCIDE REACT ICONS
// Modern icon library with consistent design and tree-shaking support
import { ArrowRight, CheckCircle, Settings, Wrench, Shield, Globe, Zap, Award, TrendingUp, Users, Clock, Star } from 'lucide-react'

// MAIN HOMEPAGE COMPONENT
// This is a Server Component by default in Next.js App Router
// Server Components render on the server, improving performance and SEO
export default function HomePage() {
  
  // DATA STRUCTURES
  // These arrays contain the content data for different sections
  // In a real app, this data might come from a CMS, database, or API
  
  // Industrial features data - showcases key product capabilities
  const industrialFeatures = [
    {
      icon: <Zap className="w-8 h-8" />, // React element as data (JSX)
      title: 'Ultra-High Performance',
      description: 'Advanced engineering delivers 99.8% efficiency with minimal energy consumption',
      metric: '99.8%', // Key performance indicator
      metricLabel: 'Efficiency'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Industrial Grade Reliability',
      description: 'Mission-critical components tested to 100,000+ hour operational standards',
      metric: '100K+',
      metricLabel: 'Hours MTBF' // Mean Time Between Failures
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Smart Automation',
      description: 'IoT-enabled monitoring with predictive maintenance and remote diagnostics',
      metric: '24/7',
      metricLabel: 'Monitoring'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Service Network',
      description: 'Worldwide support infrastructure with certified technicians in 50+ countries',
      metric: '50+',
      metricLabel: 'Countries'
    }
  ]

  // Industrial applications - case studies and use cases
  const industrialApplications = [
    {
      name: 'Semiconductor Fabrication',
      description: 'Ultra-high vacuum systems for chip manufacturing processes',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
      specs: ['10⁻⁹ Torr', 'Cleanroom Compatible', 'Oil-Free Operation'], // Technical specifications
      industry: 'Semiconductor'
    },
    {
      name: 'Pharmaceutical Processing',
      description: 'FDA-compliant vacuum solutions for sterile manufacturing',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
      specs: ['FDA Validated', 'Sterile Design', 'cGMP Compliant'],
      industry: 'Pharmaceutical'
    },
    {
      name: 'Aerospace Testing',
      description: 'Space simulation chambers for satellite component validation',
      image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop',
      specs: ['Space Grade', 'Temperature Cycling', 'Ultra-Clean'],
      industry: 'Aerospace'
    }
  ]

  // Performance statistics for social proof
  const performanceStats = [
    { value: '50+', label: 'Years Experience', icon: <Award className="w-6 h-6" /> },
    { value: '10K+', label: 'Systems Deployed', icon: <TrendingUp className="w-6 h-6" /> },
    { value: '500+', label: 'Engineering Team', icon: <Users className="w-6 h-6" /> },
    { value: '<4hr', label: 'Response Time', icon: <Clock className="w-6 h-6" /> }
  ]

  // Industry certifications for credibility
  const certifications = [
    'ISO 9001:2015',    // Quality management
    'ISO 14001:2015',   // Environmental management
    'OHSAS 18001',      // Occupational health and safety
    'CE Marking',       // European conformity
    'FDA Registration', // Food and Drug Administration
    'ASME Certified'    // American Society of Mechanical Engineers
  ]

  // COMPONENT RENDER METHOD
  // JSX return - this is the component's rendered output
  // JSX combines HTML-like syntax with JavaScript expressions
  return (
    // MAIN CONTAINER
    // min-h-screen ensures the page fills the viewport height
    <div className="min-h-screen bg-gray-900">
      
      {/* =========================
          HERO SECTION
          ========================= */}
      {/* Main banner section with gradient background and hero content */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white overflow-hidden">
        
        {/* BACKGROUND DECORATIVE ELEMENTS */}
        {/* Grid pattern overlay for visual texture */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        {/* Gradient overlay to darken the background for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        
        {/* HERO CONTENT CONTAINER */}
        <div className="relative container-custom py-24 lg:py-32">
          {/* Two-column grid layout: content on left, visual on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT COLUMN: TEXT CONTENT */}
            <div className="space-y-8">
              {/* Industry badge/tag */}
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-full px-4 py-2 text-blue-300">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Industry Leading Technology</span>
              </div>
              
              {/* MAIN HEADLINE */}
              {/* Large, multi-line headline with gradient text effect */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Industrial
                </span>
                <br />
                <span className="text-white">Vacuum</span>
                <br />
                <span className="text-blue-400">Systems</span>
              </h1>
              
              {/* SUBHEADLINE */}
              {/* Supporting description text */}
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Engineering excellence in vacuum technology for mission-critical industrial applications. 
                Trusted by Fortune 500 companies worldwide for uncompromising performance and reliability.
              </p>
              
              {/* PERFORMANCE METRICS BAR */}
              {/* Grid of key statistics for social proof */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
                {/* REACT ARRAY MAPPING */}
                {/* .map() transforms each data item into a JSX element */}
                {performanceStats.map((stat, index) => (
                  <div 
                    key={index} // React key for list optimization
                    className="text-center hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Icon with hover animation */}
                    <div className="flex justify-center mb-2 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    {/* Statistic value */}
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    {/* Statistic label */}
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* CALL-TO-ACTION BUTTONS */}
              {/* Primary and secondary action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Primary CTA - Link to products page */}
                <Link 
                  href="/products" 
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Explore Solutions
                  {/* Animated arrow icon */}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                {/* Secondary CTA - Link to contact page */}
                <Link 
                  href="/contact" 
                  className="border-2 border-gray-600 hover:border-blue-400 text-white hover:text-blue-400 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Request Quote
                </Link>
              </div>
            </div>
            
            {/* RIGHT COLUMN: HERO IMAGE/VISUAL */}
            <div className="relative">
              {/* Card container with glass morphism effect */}
              <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:shadow-xl transition-all duration-300">
                {/* NEXT.JS IMAGE COMPONENT */}
                {/* Automatically optimizes images for performance */}
                <Image
                  src="/images/hero/busch vacuum pump 1.jpg" 
                  alt="Industrial Vacuum System" // Alt text for accessibility
                  width={600}  // Explicit dimensions for optimization
                  height={400}
                  className="w-full h-80 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                />
                
                {/* FLOATING STATS CARDS */}
                {/* Positioned absolutely over the image */}
                <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold text-white">99.8%</div>
                  <div className="text-sm text-gray-300">Efficiency</div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          INDUSTRIAL FEATURES SECTION
          ========================= */}
      {/* White section showcasing key product features */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          
          {/* SECTION HEADER */}
          <div className="text-center mb-16">
            {/* Section badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 text-blue-600 mb-4">
              <Wrench className="w-4 h-4" />
              <span className="text-sm font-medium">Engineering Excellence</span>
            </div>
            {/* Section title */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Industrial-Grade Performance
            </h2>
            {/* Section description */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Precision-engineered vacuum systems designed for the most demanding industrial environments
            </p>
          </div>
          
          {/* FEATURES GRID */}
          {/* Two-column grid layout for features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MAPPING OVER FEATURES DATA */}
            {industrialFeatures.map((feature, index) => (
              // Individual feature card
              <div 
                key={index}
                className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Feature content layout */}
                <div className="flex items-start space-x-6">
                  {/* Feature icon */}
                  <div className="flex-shrink-0 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white p-4 rounded-xl transition-all duration-300">
                    {feature.icon}
                  </div>
                  {/* Feature text content */}
                  <div className="flex-1">
                    {/* Title and metric in one row */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      {/* Performance metric */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{feature.metric}</div>
                        <div className="text-sm text-gray-500">{feature.metricLabel}</div>
                      </div>
                    </div>
                    {/* Feature description */}
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          INDUSTRIAL APPLICATIONS SECTION
          ========================= */}
      {/* Gray section showing real-world use cases */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          
          {/* SECTION HEADER */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mission-Critical Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by leading industries for applications where failure is not an option
            </p>
          </div>
          
          {/* APPLICATIONS GRID */}
          {/* Three-column grid for application cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAPPING OVER APPLICATIONS DATA */}
            {industrialApplications.map((application, index) => (
              // Individual application card
              <div 
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Application image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={application.image}
                    alt={application.name}
                    width={400}
                    height={250}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Industry badge overlay */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                    {application.industry}
                  </div>
                </div>
                
                {/* Application content */}
                <div className="p-8">
                  {/* Application name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{application.name}</h3>
                  {/* Application description */}
                  <p className="text-gray-600 mb-6">{application.description}</p>
                  
                  {/* TECHNICAL SPECIFICATIONS LIST */}
                  <div className="space-y-2 mb-6">
                    {/* Mapping over specs array */}
                    {application.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Link to case study */}
                  <Link 
                    href="/projects" 
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center group"
                  >
                    View Case Study
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          CERTIFICATIONS SECTION
          ========================= */}
      {/* Dark section showing industry certifications */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container-custom">
          {/* Two-column layout: text and visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT COLUMN: CERTIFICATIONS LIST */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Certified for Excellence
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our commitment to quality is validated by international standards and certifications, 
                ensuring compliance with the most stringent industrial requirements.
              </p>
              
              {/* CERTIFICATIONS GRID */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mapping over certifications array */}
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold text-white">{cert}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* RIGHT COLUMN: ISO HIGHLIGHT CARD */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="text-center space-y-6">
                <div className="text-6xl font-bold text-blue-400">ISO</div>
                <div className="text-2xl font-semibold">Quality Certified</div>
                <p className="text-gray-300">
                  Maintaining the highest standards in manufacturing, quality control, and environmental management
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CALL-TO-ACTION SECTION
          ========================= */}
      {/* Final blue section encouraging user action */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-custom text-center">
          {/* CTA headline */}
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Engineer Your Success
          </h2>
          {/* CTA description */}
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Partner with Good Motor for vacuum solutions that exceed expectations. 
            Our engineering team is ready to tackle your most challenging applications.
          </p>
          
          {/* FINAL CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Primary action */}
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            {/* Secondary action */}
            <Link 
              href="/products" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 

/*
KEY LEARNING CONCEPTS DEMONSTRATED:

1. NEXT.JS FEATURES:
   - Server Components (default in App Router)
     * Render on the server for better performance and SEO
     * Reduce client-side JavaScript bundle size
     * Enable direct database access (not used here)
   
   - Link component for client-side navigation
     * Provides smooth page transitions without full page reloads
     * Prefetches linked pages for faster navigation
     * Maintains scroll position and form state
   
   - Image component for optimization
     * Automatic lazy loading and size optimization
     * Supports modern image formats (WebP, AVIF)
     * Prevents layout shift with explicit dimensions

   - File-based routing (this file = homepage)
     * No need to configure routes manually
     * Each page.tsx file becomes a route automatically

2. REACT PATTERNS:
   - Functional component with JSX
     * Modern React pattern using function syntax
     * JSX combines HTML-like syntax with JavaScript
     * More concise than class components
   
   - Array.map() for rendering lists
     * Transform data arrays into JSX elements
     * Each item gets a unique 'key' prop for optimization
     * Enables dynamic content rendering
   
   - Props and data flow
     * Data flows down from parent to child components
     * Props are read-only (immutable)
     * Enables component reusability
   
   - Component composition
     * Building complex UIs from simple components
     * Reusable and maintainable code structure
     * Separation of concerns

3. TAILWIND CSS:
   - Utility-first CSS framework
     * Write styles directly in className attributes
     * No need for separate CSS files
     * Consistent design system
   
   - Responsive design with breakpoint prefixes
     * sm: (640px+), md: (768px+), lg: (1024px+), xl: (1280px+)
     * Mobile-first approach (base styles for mobile)
     * Conditional styles based on screen size
   
   - Grid and Flexbox layouts
     * Modern CSS layout systems
     * Responsive grid with automatic column adjustment
     * Flexbox for alignment and spacing
   
   - Hover states and transitions
     * Interactive effects for better UX
     * Smooth animations with transition classes
     * Group hover for complex interactions

4. MODERN WEB DEVELOPMENT:
   - Mobile-first responsive design
     * Design for mobile devices first
     * Progressive enhancement for larger screens
     * Better user experience across all devices
   
   - Accessibility considerations
     * Alt text for screen readers
     * Semantic HTML elements
     * Proper color contrast
   
   - Performance optimization
     * Image optimization with Next.js
     * CSS efficiency with Tailwind
     * Server-side rendering for faster load times
   
   - Component-based architecture
     * Modular, reusable code
     * Easier maintenance and testing
     * Clear separation of concerns

5. BUSINESS WEBSITE PATTERNS:
   - Hero section with value proposition
     * Clear headline explaining what you do
     * Supporting subtext with benefits
     * Strong call-to-action buttons
   
   - Features/benefits showcase
     * Address customer pain points
     * Highlight unique selling propositions
     * Use metrics and social proof
   
   - Product/service highlights
     * Show real-world applications
     * Include technical specifications
     * Demonstrate expertise and capabilities
   
   - Clear call-to-action placement
     * Multiple CTAs throughout the page
     * Primary and secondary actions
     * Guide users toward conversion
   
   - Progressive information disclosure
     * Start with high-level benefits
     * Gradually provide more detail
     * Maintain user engagement
   
   - Social proof and credibility
     * Customer testimonials and case studies
     * Industry certifications and awards
     * Performance metrics and statistics

6. DATA MANAGEMENT:
   - Static data arrays
     * Content stored in JavaScript objects
     * Easy to modify and maintain
     * Could be replaced with CMS or API data
   
   - Structured content organization
     * Consistent data formats
     * Reusable component patterns
     * Scalable content management

7. USER EXPERIENCE (UX):
   - Visual hierarchy
     * Clear information architecture
     * Appropriate typography scale
     * Strategic use of color and contrast
   
   - Interactive feedback
     * Hover effects and animations
     * Loading states and transitions
     * Clear action responses
   
   - Performance considerations
     * Fast loading times
     * Smooth animations
     * Responsive interactions
*/ 