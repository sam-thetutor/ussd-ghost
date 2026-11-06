import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Live USSD / relayer routes must not be statically cached.
  cacheComponents: false,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
