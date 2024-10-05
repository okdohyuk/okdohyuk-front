/** @type {import('next').NextConfig} */
const runtimeCaching = require('next-pwa/cache');
const { i18n } = require('./next-i18next.config');
const path = require('path');

console.log('=>(next.config.js:4) process.env.NODE_ENV', process.env.NODE_ENV);

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
});

const nextConfig = {
  // i18n,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.okdohyuk.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};

module.exports = process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig);
