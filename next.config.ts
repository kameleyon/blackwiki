import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'jellyfish-app-2-7ub8x.ondigitalocean.app', 'afrowiki.org'],
    unoptimized: true,
  },
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    BASE_URL: process.env.BASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'jellyfish-app-2-7ub8x.ondigitalocean.app', 'afrowiki.org'],
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default config;
