/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath: '/en', // Custom route
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
