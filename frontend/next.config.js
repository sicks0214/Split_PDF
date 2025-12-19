/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // 如果需要部署在子路径，取消注释并修改
  // basePath: '/pdf-tools/split-pdf',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'
  }
}

module.exports = nextConfig
