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
  i18n,
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['okdohyuk.dev', 'localhost', 'lh3.googleusercontent.com', 'storage.googleapis.com'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};

module.exports = withPWA(nextConfig);
