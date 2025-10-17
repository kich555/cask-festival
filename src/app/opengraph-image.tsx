import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "NAVI Whisky Festival 2025"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: "#ea5514",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Whiskynavi
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          CASK CARNIVAL 2025
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#cccccc",
            textAlign: "center",
          }}
        >
          2025년 11월 1일
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
