import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/business/:id',
        destination: '/business/:id',
        permanent: true,
      },
      {
        source: '/admin/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin/login',
        destination: '/login',
        permanent: true,
      },
      // Catch-all for any other /admin routes to be stripped
      {
        source: '/admin/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
