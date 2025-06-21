import Image from 'next/image'

// Example component showing how to use internal images
export default function ImageExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Internal Images Examples</h2>
      
      {/* Example 1: Using Next.js Image component (Recommended) */}
      <div>
        <h3 className="text-lg font-semibold mb-2">1. Next.js Image Component (Recommended)</h3>
        <Image
          src="/images/company/industrial-pumps.jpg"
          alt="Industrial Pumps"
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
          priority // Use for above-the-fold images
        />
      </div>

      {/* Example 2: Responsive image with Next.js */}
      <div>
        <h3 className="text-lg font-semibold mb-2">2. Responsive Image</h3>
        <Image
          src="/images/company/industrial-pumps.jpg"
          alt="Industrial Pumps Responsive"
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Example 3: Regular img tag */}
      <div>
        <h3 className="text-lg font-semibold mb-2">3. Regular IMG Tag</h3>
        <img 
          src="/images/company/industrial-pumps.jpg" 
          alt="Industrial Pumps Regular"
          className="w-full max-w-md h-auto rounded-lg shadow-lg"
        />
      </div>

      {/* Example 4: Background image with CSS */}
      <div>
        <h3 className="text-lg font-semibold mb-2">4. CSS Background Image</h3>
        <div 
          className="w-full h-64 bg-cover bg-center rounded-lg shadow-lg"
          style={{
            backgroundImage: 'url(/images/company/industrial-pumps.jpg)'
          }}
        />
      </div>

      {/* Example 5: Dynamic image path */}
      <div>
        <h3 className="text-lg font-semibold mb-2">5. Dynamic Image Path</h3>
        {['industrial-pumps'].map((imageName) => (
          <Image
            key={imageName}
            src={`/images/company/${imageName}.jpg`}
            alt={`Dynamic ${imageName}`}
            width={300}
            height={200}
            className="rounded-lg shadow-lg"
          />
        ))}
      </div>
    </div>
  )
}

// Example usage in a product component
export function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Image
        src={product.image || '/images/products/default-product.jpg'}
        alt={product.name}
        width={400}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-blue-600 font-bold">${product.price}</p>
      </div>
    </div>
  )
} 