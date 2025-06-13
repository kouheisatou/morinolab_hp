import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    // GitHub Pages では画像最適化サーバを利用できないため unoptimized を有効にします
    unoptimized: true,
  },
  // GitHub Pages でリポジトリ名がパスに入る場合は以下を調整してください。
  // 例: リポジトリ (USER/REPO) => https://USER.github.io/REPO
  basePath: '/morinolab_hp',
  assetPrefix: '/morinolab_hp/',
  eslint: {
    // Warning: This allows production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
