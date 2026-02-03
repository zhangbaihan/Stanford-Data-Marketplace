/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Environment variables available on the client
  // NEXT_PUBLIC_API_URL is set via build args or .env
  
  // Image optimization settings
  images: {
    unoptimized: true, // For S3/static deployment compatibility
  },
}

module.exports = nextConfig
