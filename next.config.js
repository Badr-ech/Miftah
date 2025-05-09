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
  // This prevents the "Dynamic server usage" errors during build
  experimental: {
    // Disabled CSS optimization due to issues with critters package
    // optimizeCss: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'miftah.vercel.app'],
    },
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
