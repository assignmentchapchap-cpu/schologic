import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
