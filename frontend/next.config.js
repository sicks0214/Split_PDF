/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // 只在生产环境配置子路径，开发环境使用根路径以便本地测试
  basePath: process.env.NODE_ENV === 'production' ? '/pdf-tools' : '',
  // 配置资源路径前缀
  assetPrefix: process.env.NODE_ENV === 'production' ? '/pdf-tools' : '',
  env: {
    // 开发环境使用 localhost:4001，生产环境使用 /api/pdf
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'
  }
}

module.exports = nextConfig
