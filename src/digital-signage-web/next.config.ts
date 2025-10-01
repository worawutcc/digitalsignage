import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (moved from experimental)
  turbopack: {
    // Enable Turbopack for faster development
  },
  
  // External packages for server components (moved out of experimental in Next.js 15)
  serverExternalPackages: ['@tanstack/react-query', 'axios'],
  
  // Image optimization configuration for S3 integration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_S3_BUCKET: process.env.NEXT_PUBLIC_S3_BUCKET,
    NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION,
  },

  // Performance optimizations
  compress: true,
  reactStrictMode: true,
  
  // Enable modern JavaScript output
  productionBrowserSourceMaps: false,
  
  // Optimize for production
  poweredByHeader: false,
  
  // Code splitting and lazy loading
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Webpack configuration for better bundle optimization
  webpack: (config, { isServer, webpack }) => {
    // Add polyfill for 'self' in server-side rendering
    if (isServer) {
      // Inject global polyfill for 'self'
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'global',
        })
      );
      
      // Add fallback for browser-only globals
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
};

export default nextConfig;
