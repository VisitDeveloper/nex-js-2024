/** @type {import('next').NextConfig} */
const apiBaseUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT ||
  "http://127.0.0.1:1337/api";

const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // basePath: '/en', // Custom route
  async rewrites() {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return [
      /**
       * Proxy Strapi Content API paths that have no Next Route Handler.
       * Do NOT catch-all `/api/shop/*` — those must hit Next (checkout, stripe-webhook, etc.).
       */
      {
        source: "/api/:path((?!shop(?:/|$)).*)",
        destination: `${base}/:path`,
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
        protocol: "http",
        hostname: "127.0.0.1",
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
