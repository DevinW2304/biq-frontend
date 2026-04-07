/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ak-static.cms.nba.com',
      },
    ],
  },
};

module.exports = nextConfig;