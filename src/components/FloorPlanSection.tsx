"use client"

import Image from "next/image"

const FLOOR_LABELS = [
  "E. 익스클루시브 판매",
  "1. 위오크",
  "2. 코아베스트",
  "3. 화심주조",
  "4. 다농바이오",
  "5. 온증류소",
  "6. 안동진맥소주",
  "7. 크래프트브로스",
  "8. 김창수 위스키 증류소",
  "9. 윌로우드",
  "10. 카메다 증류소",
  "11. 사쿠라오 증류소",
  "12. 쿠주 증류소",
  "13. 폴존",
  "14. 포케노 증류소",
  "15. 드램모어",
  "16. 앤트 인터내셔널",
  "17. 더 싱글캐스크",
  "18. 위스키에이지",
  "19. 더 위스키파인드",
  "20. 위스키 체이서",
  "21. 디스틸러스셀렉트",
  "22. 캐스크 트레이드",
  "23. 메타베브",
  "24. 한국버번위스키클럽",
  "25. 하트 브라더스",
  "H-1. 위스키내비",
  "H-2. 더 위스키테일즈",
  "SG. 스페셜게스트",
  "H-0. 구산증류소",
]

export default function FloorPlanSection() {
  return (
    <section id="floor-plan" className=" px-4 md:px-8 bg-[#121212]/50 mt-[80px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">부스배치도</h2>
          <p className="text-[20px] md:text-[28px] font-medium">FLOOR PLAN</p>
          <div className="mt-4 inline-block">
            <p className="text-[14px] md:text-[16px] text-amber-400/80 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
              ※ 부스 배치도는 행사 준비 상황에 따라 변경될 수 있습니다
            </p>
          </div>
        </div>

        <Image
          src="/mapv2.png"
          alt="floor plan"
          width={1280}
          height={865}
          className="mx-auto"
        />
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 text-white text-[16px] md:text-[20px] font-bold mt-12">
            {FLOOR_LABELS.map((label) => (
              <div key={label} className="text-center font-bold">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
