import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: true,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
