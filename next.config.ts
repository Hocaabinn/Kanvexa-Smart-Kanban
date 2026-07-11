import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
