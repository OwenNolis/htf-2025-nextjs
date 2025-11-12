import type { NextConfig } from "next";

// Initialization
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      // Add other domains as needed
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
