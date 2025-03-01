/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['localhost', 'afrowiki.onrender.com', 'afrowiki.org'],
    formats: ['image/webp'], // Prefer WebP format for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Icon sizes
    minimumCacheTTL: 60 * 60 * 24, // Cache images for 24 hours
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment', // Improve security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images
      },
    ],
  },
  
  // Environment variables
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    BASE_URL: process.env.BASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    REDIS_URL: process.env.REDIS_URL,
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'afrowiki.onrender.com', 'afrowiki.org'],
      bodySizeLimit: '2mb',
    },
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: ['react-icons'], // Optimize large package imports
  },
  
  // External packages
  serverExternalPackages: ['sharp'], // Keep sharp as external package
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log in production
  },
  
  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  reactStrictMode: true, // Enable React strict mode
  
  // Build settings
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize CSS
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
        },
      };
    }

    // Fix Chart.js issues
    if (!isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }

    // Add resolve fallbacks for Chart.js
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    Object.assign(config.resolve.fallback, {
      canvas: false,
    });

    // Configure webpack cache
    config.cache = false; // Disable webpack caching temporarily to fix the build
    
    return config;
  },
};

export default config;
