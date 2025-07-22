import Image from 'next/image'

export default function AboutPage() {
  const milestones = [
    {
      year: '1995',
      title: 'Company Founded',
      description: 'Good Motor was established with a vision to provide high-quality vacuum solutions.',
    },
    {
      year: '2000',
      title: 'First Patent',
      description: 'Developed our first patented vacuum pump technology, setting new industry standards.',
    },
    {
      year: '2010',
      title: 'Global Expansion',
      description: 'Expanded operations internationally, serving customers across 50+ countries.',
    },
    {
      year: '2020',
      title: 'Innovation Award',
      description: 'Received the Industrial Innovation Award for our eco-friendly pump designs.',
    },
  ]

  const values = [
    {
      title: 'Quality Excellence',
      description: 'We maintain the highest standards in manufacturing and testing.',
      icon: '🏆',
    },
    {
      title: 'Customer Focus',
      description: 'Our customers\' success drives everything we do.',
      icon: '🎯',
    },
    {
      title: 'Innovation',
      description: 'Continuous improvement and cutting-edge technology.',
      icon: '💡',
    },
    {
      title: 'Sustainability',
      description: 'Committed to environmentally responsible manufacturing.',
      icon: '🌱',
    },
  ]

  const team = [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      description: 'Leading Good Motor with over 30 years of experience in vacuum technology.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    },
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      description: 'Driving innovation and technical excellence in pump design and manufacturing.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc',
    },
    {
      name: 'Michael Chen',
      position: 'VP of Engineering',
      description: 'Overseeing product development and ensuring quality across all product lines.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-900 to-secondary-700 text-white section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                About Good Motor
              </h1>
              <p className="text-xl text-secondary-100 mb-8">
                For over 25 years, Good Motor has been at the forefront of vacuum pump technology, 
                delivering innovative solutions that power industries worldwide.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary-400">25+</div>
                  <div className="text-secondary-300">Years of Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-400">10,000+</div>
                  <div className="text-secondary-300">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-400">50+</div>
                  <div className="text-secondary-300">Countries Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-400">100+</div>
                  <div className="text-secondary-300">Product Models</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/company/industrial-pumps.jpg"
                alt="Good Motor Manufacturing Facility"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From humble beginnings to global leadership in vacuum technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                Built on Innovation and Trust
              </h3>
              <p className="text-secondary-600 mb-6">
                Good Motor was founded in 1995 with a simple mission: to create vacuum pumps that 
                exceed customer expectations in performance, reliability, and efficiency. What started 
                as a small engineering firm has grown into a global leader in vacuum technology.
              </p>
              <p className="text-secondary-600 mb-6">
                Our commitment to research and development has led to numerous breakthroughs in 
                vacuum pump design, earning us recognition as an industry innovator. We've consistently 
                invested in cutting-edge manufacturing processes and quality control systems.
              </p>
              <p className="text-secondary-600">
                Today, Good Motor pumps are trusted by industries ranging from pharmaceuticals and 
                semiconductors to food processing and environmental services. Our products help 
                companies achieve their production goals while maintaining the highest standards 
                of quality and efficiency.
              </p>
            </div>
            <div>
              <Image
                src="/images/hero/busch-vacuum-pump-2.webp"
                alt="Vacuum Pump Technology"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-secondary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-secondary-600">
              Key milestones in our company's growth and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {milestone.year}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{milestone.title}</h3>
                <p className="text-secondary-600">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-secondary-600">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{value.title}</h3>
                <p className="text-secondary-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section-padding bg-secondary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-secondary-600">
              Meet the experts leading Good Motor into the future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-1">{member.name}</h3>
                  <div className="text-primary-600 font-medium mb-3">{member.position}</div>
                  <p className="text-secondary-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 