import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // next/image가 전달 시점에 AVIF/WebP로 변환하도록 명시 (원본 PNG는 그대로 두고 응답만 경량화)
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // /public 정적 자산 장기 캐시 → 재방문 시 폰트/이미지/히어로 iframe 재다운로드 방지
        source: "/:path*.(png|jpg|jpeg|webp|avif|svg|otf|ttf|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 히어로 애니메이션 HTML(?v= 로 버전 관리 중이므로 안전하게 장기 캐시)
        source: "/2026/hero-scene.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}

export default nextConfig
