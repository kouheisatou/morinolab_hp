/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePathを設定 - 環境変数で制御
  basePath: process.env.BASEPATH_ENABLED === 'true' ? '/morinolab_hp' : '',
  assetPrefix: process.env.BASEPATH_ENABLED === 'true' ? '/morinolab_hp/' : '',
  // 開発中はoutput: exportを無効にして、本番でのみ有効にする
  // output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // missingSuspenseWithCSRBailout: false, // この設定は不要
  },
};

module.exports = nextConfig;
