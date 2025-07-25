/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Note: No need to configure domains for internal images
    // Internal images in /public are automatically allowed
  },
  
  // Performance optimizations
  compiler: {
    // Enable SWC minification for better performance
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 