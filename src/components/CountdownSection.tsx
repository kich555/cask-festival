"use client"

import useTimeLeft from "@/hooks/useTimeLeft"

export default function CountdownSection() {
  const timeLeft = useTimeLeft()

  return (
    <section id="countdown" className="flex flex-col items-center justify-center mt-[52px]">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">
          CARNIVAL START IN
        </h2>
        <div className="grid grid-cols-2 gap-6 md:flex md:justify-center md:space-x-16 mt-5">
          <div className="text-center">
            <div className="text-[36px] md:text-[72px] font-bold">{timeLeft.days}</div>
            <div className="text-[14px] md:text-[18px] font-medium">DAYS</div>
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[72px] font-bold">{timeLeft.hours}</div>
            <div className="text-[14px] md:text-[18px] font-medium">HOURS</div>
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[72px] font-bold">{timeLeft.minutes}</div>
            <div className="text-[14px] md:text-[18px] font-medium">MINUTES</div>
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[72px] font-bold">{timeLeft.seconds}</div>
            <div className="text-[14px] md:text-[18px] font-medium">SECONDS</div>
          </div>
        </div>
      </div>

      <a
        href="https://smartstore.naver.com/whiskynavi"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#ea5514] cursor-pointer text-black px-8 md:px-12 py-3 md:py-4 text-[20px] md:text-[24px] font-medium rounded hover:bg-[#bf3b0b] transition-colors mt-10"
      >
        티켓 구매
      </a>
    </section>
  )
}
