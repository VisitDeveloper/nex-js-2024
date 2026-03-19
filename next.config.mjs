/** @type {import('next').NextConfig} */
const apiBaseUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  "http://127.0.0.1:1337/api";

const nextConfig = {
  output: "standalone",
  // basePath: '/en', // Custom route
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.bwaveedu.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "api.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "unsplash.it",
      },
      {
        protocol: "http",
        hostname: "loremflickr.com",
      },
    ],
  },
};

export default nextConfig;
