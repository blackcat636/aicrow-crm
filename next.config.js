/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__nextjs_original-stack-frames',
        destination: '/404'
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3010',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'storage.uncar.us',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'api.uncar.us',
        pathname: '/**'
      }
    ]
  }
};

module.exports = nextConfig;
