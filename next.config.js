const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
const { i18n } = require('./next-i18next.config');

console.log('=>(next.config.js:4) process.env.NODE_ENV', process.env.NODE_ENV);

const nextConfig = {
  pwa: {
    dest: 'public',
    runtimeCaching,
    disable: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
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
  i18n,
};

module.exports = withPWA(nextConfig);
