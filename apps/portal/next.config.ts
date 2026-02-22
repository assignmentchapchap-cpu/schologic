import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 1 month cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'lodash'],
  },
  serverExternalPackages: ['pdf-parse', 'mammoth', 'xml2js'],
  transpilePackages: ['@schologic/ai-bridge', '@schologic/database', '@schologic/doc-engine', '@schologic/practicum-core'],
};

export default nextConfig;
