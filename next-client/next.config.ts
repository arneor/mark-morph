import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  turbopack: {
    root: process.cwd(),
  }, images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for now during migration/dev
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
