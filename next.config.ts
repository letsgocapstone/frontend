import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ['unoffi-bucket.s3.ap-northeast-2.amazonaws.com'], // 이미지를 허용할 도메인 추가
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',       // 프론트에서 /api/* 로 요청하면
        // destination: 'http://localhost:8080/:path*' // 백엔드로 프록시
        destination:'https://api.unoffimap.site/:path*',
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
