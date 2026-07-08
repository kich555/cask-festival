"use client"

import { useEffect, useState } from "react"

/**
 * 히어로 배경.
 *
 * 데스크톱(마우스 포인터, 넓은 화면)에서는 기존 애니메이션 iframe을 그대로 띄운다.
 * 카카오톡 등 모바일/터치 인앱 브라우저에서는 애니메이션 대신 장면 캡처 포스터
 * (_p.png)만 보여준다.
 *
 * 이유: 히어로 애니메이션(대형 blur 레이어 상시 재래스터링 + 23겹 3D SVG)이
 * 자원이 제한된 인앱 WebView의 렌더러 프레임 루프를 포화시켜, 빠르게 스크롤하면
 * 탭이 얼었다가 리로드되며 맨 위로 튕기는 현상을 유발한다. 이 포화는 rAF/scroll/
 * IntersectionObserver 콜백까지 굶기기 때문에 JS로 iframe을 나중에 떼어내는 방식이
 * 확실히 동작하지 않는다. 그래서 문제가 실제로 발생하는 모바일에서는 처음부터
 * 애니메이션을 올리지 않는다. 포스터는 장면 캡처라 정지 화면의 모습은 동일하다.
 *
 * SSR/최초 페인트에서는 포스터만 렌더(iframe 없음)하여 하이드레이션 불일치가 없고,
 * 데스크톱에서만 마운트 후 iframe으로 승격한다.
 */
export default function HeroScene() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches
    const wideEnough = window.innerWidth >= 1024
    setAnimate(finePointer && wideEnough)
  }, [])

  return (
    <div
      className="absolute inset-0 bg-[#07050a] bg-cover bg-center pointer-events-none"
      style={{ backgroundImage: "url(/2026/_p.png)" }}
    >
      {animate && (
        <iframe
          src="/2026/hero-scene.html?v=3"
          title="Cask Carnival"
          loading="eager"
          scrolling="no"
          className="absolute inset-0 w-full h-full border-0"
        />
      )}
    </div>
  )
}
