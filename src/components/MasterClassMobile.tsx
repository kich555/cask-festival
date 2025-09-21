"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { useCallback } from "react"
import type { Session, Sessions } from "./MasterClassSection"

interface MasterClassMobileProps {
  sessions: Sessions
}

export default function MasterClassMobile({ sessions }: MasterClassMobileProps) {
  // SESSIONS 배열을 평탄화하여 모든 세션을 하나의 배열로 만들기
  const allSessions: Array<Session & { day: string; sessionLabel: string; time: string }> = []

  sessions.forEach((timeSlot) => {
    // Saturday 세션들
    allSessions.push({
      ...timeSlot.sat.loungeA,
      day: "11.01 (SAT)",
      sessionLabel: "LOUNGE A",
      time: timeSlot.time,
    })
    allSessions.push({
      ...timeSlot.sat.loungeB,
      day: "11.01 (SAT)",
      sessionLabel: "LOUNGE B",
      time: timeSlot.time,
    })
    // Sunday 세션들
    allSessions.push({
      ...timeSlot.sun.loungeA,
      day: "11.02 (SUN)",
      sessionLabel: "LOUNGE A",
      time: timeSlot.time,
    })
    allSessions.push({
      ...timeSlot.sun.loungeB,
      day: "11.02 (SUN)",
      sessionLabel: "LOUNGE B",
      time: timeSlot.time,
    })
  })
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="lg:hidden relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {allSessions.map((session, index) => (
            <div key={index} className="flex-none w-full px-4">
              <div className="max-w-sm mx-auto">
                {/* Day와 Session 라벨 */}
                <div className="text-center mb-4">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white">{session.day}</h3>
                  <p className="text-[20px] md:text-[25px] font-medium text-[#ea5514]">
                    {session.sessionLabel}
                  </p>
                </div>
                {/* 세션 카드 */}
                <div className="text-center">
                  {/* 이미지 */}
                  <div className="bg-gray-800 h-[250px] md:h-[311px] w-full max-w-[250px] mx-auto rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={session.imageSrc}
                      alt={session.alt || session.title}
                      width={250}
                      height={311}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 이름/소속 */}
                  <div className="bg-black/80 p-3 md:p-4 rounded mb-4">
                    <h5 className="text-[20px] md:text-[24px] text-white mb-2">{session.title}</h5>
                    <p className="text-[16px] md:text-[20px] text-[#ea5514]">{session.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          type="button"
          onClick={scrollPrev}
          className="text-[#ea5514] cursor-pointer p-2 transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={scrollNext}
          className="text-[#ea5514] cursor-pointer p-2 transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
