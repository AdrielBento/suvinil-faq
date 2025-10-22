// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

// This recreates __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  outputFileTracingRoot: path.join(__dirname),
  experimental: { optimizePackageImports: ['react', 'react-dom'] }
};

export default nextConfig;
