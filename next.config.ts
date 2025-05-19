import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ['via.placeholder.com'], // 이미지를 허용할 도메인 추가
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',       // 프론트에서 /api/* 로 요청하면
        destination: 'http://localhost:8080/:path*' // 백엔드로 프록시
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
