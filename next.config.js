/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle critical dependency warnings
    config.module = {
      ...config.module,
      exprContextCritical: false,
      unknownContextCritical: false,
    }

    return config
  },
  // Ignore build warnings from specific packages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 