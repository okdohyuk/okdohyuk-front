const withPWA = require('next-pwa');

const nextConfig = {
  pwa: {
    dest: 'public',
  },
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
