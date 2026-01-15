import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdf-parse', 'mammoth', 'xml2js'],
  transpilePackages: ['@schologic/ai-bridge', '@schologic/database', '@schologic/doc-engine'],
};

export default nextConfig;
