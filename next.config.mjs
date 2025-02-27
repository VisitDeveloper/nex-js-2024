/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/en', // Custom route
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:1337/api/:path*",
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
    ],
  },
};

export default nextConfig;
