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
};

module.exports = withPWA(nextConfig);
