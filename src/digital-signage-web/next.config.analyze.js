/**
 * Bundle analysis configuration for Next.js
 * Run with: npm run analyze
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle splitting optimization
  webpack: (config, { isServer, dev }) => {
    // Only add bundle analyzer in production analysis
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    // Optimize chunks for better caching
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor libraries (stable, rarely change)
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          // React and React-DOM (very stable)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          // UI components (shared across pages)
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 15,
            chunks: 'all',
            minChunks: 2,
          },
          // Feature components (feature-specific)
          features: {
            test: /[\\/]src[\\/]features[\\/]/,
            name: 'features',
            priority: 12,
            chunks: 'all',
            minChunks: 2,
          },
          // Services and utilities
          services: {
            test: /[\\/]src[\\/](services|lib|hooks)[\\/]/,
            name: 'services',
            priority: 11,
            chunks: 'all',
            minChunks: 2,
          },
        },
      }
    }

    // Tree shaking optimization
    config.optimization.usedExports = true
    config.optimization.sideEffects = false

    return config
  },

  // Performance optimizations
  experimental: {
    // Enable modern output
    outputFileTracingRoot: process.cwd(),
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'react-hot-toast',
      'date-fns',
    ],
    // Enable turbo mode
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Static optimization
  swcMinify: true,
  
  // Headers for caching
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
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig