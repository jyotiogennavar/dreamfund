import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16 enables this by default; the cache write can wedge the
    // Windows dev server so localhost accepts TCP but never responds.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
