import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd39mujgedhhp01.cloudfront.net',  // Added specific subdomain
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
export default nextConfig;
