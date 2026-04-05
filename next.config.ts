import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DIST_DIR = process.env.NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  distDir: DIST_DIR,
  async rewrites() {
    return [
      {
        // 백엔드가 서빙하는 업로드 이미지를 Next.js를 통해 프록시
        source: "/uploads/:path*",
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
