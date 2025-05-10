// Disable TypeScript checking for this file
// @ts-nocheck

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },  // Handle the dynamic server usage errors
  // Note: Next.js 15 doesn't support 'hybrid' output anymore
  output: 'standalone',
  // Explicitly mark routes that use cookies() as dynamic
  // This prevents the "Dynamic server usage" errors during build  experimental: {
    // Disabled CSS optimization due to issues with critters package
    // optimizeCss: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'miftah-edu.vercel.app', 'miftah.vercel.app'],
    },
  },
  // Configure headers to help with CORS and cookie handling
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://miftah-edu.vercel.app' 
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  // Configure both Webpack and Turbopack to work consistently
  turbo: {
    loaders: {
      // Common loaders for both bundlers
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.ts': 'tsx',
      '.tsx': 'tsx',
    },
    // Add resolution rules for compatibility
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    resolveNodeModules: true,
  },
    // Fix for require.extensions warning with handlebars
  webpack: (config) => {
    // Handle the handlebars require.extensions issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
