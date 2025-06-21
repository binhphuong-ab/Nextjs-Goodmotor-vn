# Images Storage Guide

## Folder Structure

```
public/
├── images/
│   ├── products/          # Product images
│   ├── company/           # Company/about page images
│   ├── hero/              # Homepage hero images
│   └── logo/              # Logo and branding images
└── README.md
```

## How to Use Internal Images

### 1. Store Images in Public Folder
- Place images in `/public/images/[category]/`
- Images are accessible via `/images/[category]/filename.jpg`

### 2. Reference in Components
```jsx
// Using Next.js Image component
import Image from 'next/image'

<Image
  src="/images/hero/industrial-pumps.jpg"
  alt="Industrial Pumps"
  width={600}
  height={400}
  className="rounded-lg"
/>

// Using regular img tag
<img 
  src="/images/products/vacuum-pump.jpg" 
  alt="Vacuum Pump"
  className="w-full h-auto"
/>
```

### 3. Benefits of Internal Images
- ✅ Better performance (local loading)
- ✅ No external dependencies
- ✅ No CORS issues
- ✅ Reliable (no broken links)
- ✅ Better SEO
- ✅ Easier to manage

### 4. Recommended Image Formats
- **WebP**: Best compression and quality
- **JPEG**: For photos
- **PNG**: For images with transparency
- **SVG**: For icons and logos

### 5. Image Optimization Tips
- Optimize images before uploading (use tools like TinyPNG)
- Use appropriate dimensions
- Consider responsive images with Next.js Image component 