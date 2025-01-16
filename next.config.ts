import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd39mujgedhhp01.cloudfront.net',  // Existing domain
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img-9gag-fun.9cache.com',  // Existing domain
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',  // ✅ Allow all Vercel Blob domains
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'kicg90yzimfez6ec.public.blob.vercel-storage.com',  // ✅ Specific domain
        pathname: '**',
      }
    ],
  },
};

module.exports = nextConfig;
export default nextConfig;
