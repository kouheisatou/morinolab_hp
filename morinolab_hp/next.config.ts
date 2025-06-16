import type { NextConfig } from "next";

// Get base prefix from environment (e.g., "/morinolab_hp").
// IMPORTANT: Use NEXT_PUBLIC_ prefix so it is available on the client as well.
const BASE_PREFIX = process.env.NEXT_PUBLIC_BASE_PREFIX ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // basePath must start with "/" and have no trailing slash when defined.
  basePath: BASE_PREFIX || undefined,
  // assetPrefix often has a trailing slash – only set when we have a prefix.
  assetPrefix: BASE_PREFIX ? `${BASE_PREFIX}/` : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
