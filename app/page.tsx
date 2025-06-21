import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Settings, Wrench, Shield, Globe, Zap, Award, TrendingUp, Users, Clock, Star } from 'lucide-react'

export default function HomePage() {
  const industrialFeatures = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Ultra-High Performance',
      description: 'Advanced engineering delivers 99.8% efficiency with minimal energy consumption',
      metric: '99.8%',
      metricLabel: 'Efficiency'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Industrial Grade Reliability',
      description: 'Mission-critical components tested to 100,000+ hour operational standards',
      metric: '100K+',
      metricLabel: 'Hours MTBF'
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

  const industrialApplications = [
    {
      name: 'Semiconductor Fabrication',
      description: 'Ultra-high vacuum systems for chip manufacturing processes',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
      specs: ['10⁻⁹ Torr', 'Cleanroom Compatible', 'Oil-Free Operation'],
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

  const performanceStats = [
    { value: '50+', label: 'Years Experience', icon: <Award className="w-6 h-6" /> },
    { value: '10K+', label: 'Systems Deployed', icon: <TrendingUp className="w-6 h-6" /> },
    { value: '500+', label: 'Engineering Team', icon: <Users className="w-6 h-6" /> },
    { value: '<4hr', label: 'Response Time', icon: <Clock className="w-6 h-6" /> }
  ]

  const certifications = [
    'ISO 9001:2015',
    'ISO 14001:2015', 
    'OHSAS 18001',
    'CE Marking',
    'FDA Registration',
    'ASME Certified'
  ]

  // JSX return - this is the component's rendered output
  // JSX combines HTML-like syntax with JavaScript expressions
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Industrial Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        
        <div className="relative container-custom py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Industrial Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-full px-4 py-2 text-blue-300">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Industry Leading Technology</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Industrial
                </span>
                <br />
                <span className="text-white">Vacuum</span>
                <br />
                <span className="text-blue-400">Systems</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Engineering excellence in vacuum technology for mission-critical industrial applications. 
                Trusted by Fortune 500 companies worldwide for uncompromising performance and reliability.
              </p>
              
              {/* Performance Metrics Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
                {performanceStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2 text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/products" 
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Explore Solutions
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className="border-2 border-gray-600 hover:border-blue-400 text-white hover:text-blue-400 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Request Quote
                </Link>
              </div>
            </div>
            
            {/* Right Column: Industrial Visualization */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <Image
                  src="/images/hero/industrial-pump-3.jpg"
                  alt="Industrial Vacuum System"
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-xl"
                />
                
                {/* Floating Stats Cards */}
                <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">99.8%</div>
                  <div className="text-sm text-gray-300">Efficiency</div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Features Section */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 text-blue-600 mb-4">
              <Wrench className="w-4 h-4" />
              <span className="text-sm font-medium">Engineering Excellence</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Industrial-Grade Performance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Precision-engineered vacuum systems designed for the most demanding industrial environments
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {industrialFeatures.map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white p-4 rounded-xl transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{feature.metric}</div>
                        <div className="text-sm text-gray-500">{feature.metricLabel}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrial Applications Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mission-Critical Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by leading industries for applications where failure is not an option
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {industrialApplications.map((application, index) => (
              <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <Image
                    src={application.image}
                    alt={application.name}
                    width={400}
                    height={250}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                    {application.industry}
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{application.name}</h3>
                  <p className="text-gray-600 mb-6">{application.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {application.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </div>
                    ))}
                  </div>
                  
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

      {/* Certifications & Standards Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Certified for Excellence
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our commitment to quality is validated by international standards and certifications, 
                ensuring compliance with the most stringent industrial requirements.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <div className="text-sm font-semibold text-white">{cert}</div>
                  </div>
                ))}
              </div>
            </div>
            
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Engineer Your Success
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Partner with Good Motor for vacuum solutions that exceed expectations. 
            Our engineering team is ready to tackle your most challenging applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
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
   - Link component for client-side navigation
   - Image component for optimization
   - File-based routing (this file = homepage)

2. REACT PATTERNS:
   - Functional component with JSX
   - Array.map() for rendering lists
   - Props and data flow
   - Component composition

3. TAILWIND CSS:
   - Utility-first CSS framework
   - Responsive design with breakpoint prefixes (sm:, md:, lg:)
   - Grid and Flexbox layouts
   - Hover states and transitions

4. MODERN WEB DEVELOPMENT:
   - Mobile-first responsive design
   - Accessibility considerations (alt text, semantic HTML)
   - Performance optimization (image loading, CSS efficiency)
   - Component-based architecture

5. BUSINESS WEBSITE PATTERNS:
   - Hero section with value proposition
   - Features/benefits showcase
   - Product/service highlights
   - Clear call-to-action placement
   - Progressive information disclosure
*/ 