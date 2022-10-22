const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
const { i18n } = require('./next-i18next.config');

console.log('=>(next.config.js:4) process.env.NODE_ENV', process.env.NODE_ENV);

const nextConfig = {
  i18n,
  pwa: {
    dest: 'public',
    runtimeCaching,
    disable: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: [`${process.env.NEXT_PUBLIC_VERCEL_URL}`, 'localhost'],
  },
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
