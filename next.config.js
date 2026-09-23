/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // lib/og.tsx reads these with fs at runtime, which the file tracer can't
    // see; without this they're missing from the deployed functions.
    outputFileTracingIncludes: {
      '/opengraph-image': ['./assets/fonts/*.ttf'],
      '/players/[id]/opengraph-image': ['./assets/fonts/*.ttf'],
    },
  },
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