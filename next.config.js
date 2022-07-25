const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
console.log('=>(next.config.js:4) process.env.NODE_ENV', process.env.NODE_ENV);
const nextConfig = {
  pwa: {
    dest: 'public',
    runtimeCaching,
    disable: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  /*swcMinify: true,*/
  /*experimental: {
    concurrentFeatures: true,
    serverComponents: true,
  },*/
  /*images: {
    formats: ['image/avif', 'image/webp'],
  },*/
};

module.exports = withPWA(nextConfig);
