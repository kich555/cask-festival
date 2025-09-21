"use client"

import Image from "next/image"

const FLOOR_LABELS = [
  "E. Special Guest",
  "1. 위오크",
  "2. 코아베스트",
  "3. 화심주조",
  "4. 다농바이오",
  "5. 온증류소",
  "6. 안동진맥소주",
  "7. 크래프트브로스",
  "8. 김창수위스키증류소",
  "9. 윌로우드",
  "10. 카메다 증류소",
  "11. 사쿠라오 증류소",
  "12. 쿠주 증류소",
  "13. 폴 존",
  "14. 포케노 증류소",
  "15. 드램모어 그룹",
  "16. 앤트인터내셔널",
  "17. 더 싱글캐스크",
  "18. 위스키에이지",
  "19. 더 위스키파인드",
  "20. 더 위스키테일즈",
  "21. 디스틸러셀렉트",
  "22. 캐스크 트레이드",
  "23. 메타베브",
  "24. 코리아버번위스키클럽",
  "25. 하트 브라더스",
  "H-1. 위스키내비",
  "H-2. 위스키테일즈",
  "H-3. 구산증류소",
]

export default function FloorPlanSection() {
  return (
    <section id="floor-plan" className=" px-4 md:px-8 bg-[#121212]/50 mt-[80px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">부스배치도</h2>
          <p className="text-[20px] md:text-[28px] font-medium">FLOOR PLAN</p>
        </div>

        <Image
          src="/floor-plan.png"
          alt="floor plan"
          width={1280}
          height={865}
          className="mx-auto"
        />
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 text-white text-[16px] md:text-[20px] font-bold mt-12">
            {FLOOR_LABELS.map((label, index) => (
              <div key={index} className="text-center font-bold">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
