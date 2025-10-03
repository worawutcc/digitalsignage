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
  
  // Enhanced code splitting and lazy loading
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    '@tanstack/react-query': {
      transform: '@tanstack/react-query/{{member}}',
      preventFullImport: true,
    },
    'framer-motion': {
      transform: 'framer-motion/{{member}}',
      preventFullImport: true,
    },
    'lodash': {
      transform: 'lodash/{{member}}',
      preventFullImport: true,
    },
  },

  // Enhanced bundle analysis and optimization
  experimental: {
    // Enable advanced optimizations
    optimizePackageImports: [
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      'lodash',
      'date-fns',
    ],
    // Enable turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable CSS chunking
    cssChunking: true,

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

  // Enhanced webpack configuration for bundle optimization
  webpack: (config, { isServer, webpack, dev }) => {
    // Enhanced bundle optimization
    if (!dev) {
      // Optimize chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for stable dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000, // 244KB chunks
              priority: 10,
            },
            // Enhanced UI libraries chunk
            enhancedUI: {
              test: /[\\/]node_modules[\\/](@tanstack|framer-motion|react-hook-form|@hookform)[\\/]/,
              name: 'enhanced-ui',
              chunks: 'all',
              priority: 20,
            },
            // Icons chunk
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 15,
            },
            // Utilities chunk
            utils: {
              test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|tailwind-merge)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 15,
            },
            // Default chunk for app code
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 244000,
            },
          },
        },
        // Enhanced module concatenation
        concatenateModules: true,
        // Remove empty chunks
        removeEmptyChunks: true,
        // Merge duplicate chunks
        mergeDuplicateChunks: true,
      };

      // Bundle analyzer for production builds
      if (process.env.ANALYZE === 'true') {
        const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
          enabled: true,
        });
        config.plugins.push(BundleAnalyzerPlugin);
      }
    }

    // Enhanced tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

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

    // Enhanced alias for better imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
      '@/components': '/src/components',
      '@/lib': '/src/lib',
      '@/hooks': '/src/hooks',
      '@/features': '/src/features',
      '@/store': '/src/store',
    };

    // Optimize CSS imports
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                'tailwindcss',
                'autoprefixer',
                ...(dev ? [] : ['cssnano']),
              ],
            },
          },
        },
      ],
    });

    return config
  },

  // Enhanced bundle optimization settings
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Enhanced output settings for production
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),

  // Enhanced static optimization
  optimizeFonts: true,
  swcMinify: true,
};

export default nextConfig;
