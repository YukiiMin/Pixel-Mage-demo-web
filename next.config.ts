import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Fix Turbopack continuous recompiling
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/placeholder/**',
      },
    ],
  },
  /* Proxy tất cả /api/* và /oauth2/* sang Spring Boot monolith */
  async rewrites() {
    return [
      {
        source: '/oauth2/:path*',
        destination: `${(process.env.BACKEND_URL_NGROK || process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '')}/oauth2/:path*`,
      },
    ]
  },
  // Cấu hình Turbopack (nếu chạy next dev --turbo)
  // Hiện tại Turbopack trong Next.js 15+ đã tự động support Tailwind v4 và path aliases (@/*).
  // Chỉ thêm quy tắc vào đây nếu bạn có loader đặc biệt (như @svgr/webpack cho SVG).
  turbopack: {
    rules: {
      // Ví dụ: Cấu hình SVG nếu bạn dùng thư viện ngoài
      // "*.svg": {
      // 	loaders: ["@svgr/webpack"],
      // 	as: "*.js",
      // },
    },
    resolveAlias: {
      // Các alias tùy chỉnh không nằm trong tsconfig.json
    },
  },
  // Disable React strict mode in development
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
