/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: { dynamic: 0, static: 0 },
    serverActions: { bodySizeLimit: "5mb" },
  },
};
export default nextConfig;
