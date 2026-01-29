import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  serverExternalPackages: ['pdf-parse', 'mammoth', 'xml2js', '@schologic/rag'],
  transpilePackages: ['@schologic/ai-bridge', '@schologic/database', '@schologic/doc-engine'],
};

export default nextConfig;
