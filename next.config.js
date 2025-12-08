/** @type {import('next').NextConfig} */

const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   appDir: true,
  //   typedRoutes: false,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/public/**',
      },
      {
        protocol: 'https',
        hostname: 'luuchi.com.vn',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/*',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
