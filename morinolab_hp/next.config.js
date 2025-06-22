/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/morinolab_hp',
  assetPrefix: '/morinolab_hp/',
  output: "export",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
