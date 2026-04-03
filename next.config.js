/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.replit.dev', '*.spock.replit.dev'],
}

module.exports = nextConfig
