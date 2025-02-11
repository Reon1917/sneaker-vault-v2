/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: '**.stockx.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.goat.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.flightclub.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.img1-fg.wfcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.stadiumgoods.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
