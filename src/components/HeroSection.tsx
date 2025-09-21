"use client"

import Image from "next/image"

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center mt-[40px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
        radial-gradient(circle at top left, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at top right, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at bottom left, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at bottom right, rgba(18,18,18,0.6) 0px, transparent 42px),
        linear-gradient(to right, rgba(18,18,18,0.6) 0px, transparent 42px, transparent calc(100% - 42px), rgba(18,18,18,0.6) 100%),
        linear-gradient(to bottom, rgba(18,18,18,0.6) 0px, transparent 42px, transparent calc(100% - 42px), rgba(18,18,18,0.6) 100%)
      `,
        }}
      />

      <div className="relative z-10 text-center px-4">
        <div>
          <Image
            src="/hero-icon.png"
            alt="logo"
            width={236}
            height={278}
            className="mx-auto mb-6 md:mb-8 w-[153px] h-[180px] md:w-[236px] md:h-[278px]"
          />
        </div>

        <h2 className="text-[28px] md:text-[48px] mt-[42px] font-extrabold text-[#ea5514] leading-tight">
          CASK CARNIVAL IS COMING!
        </h2>

        <div className="text-[24px] md:text-[40px] font-semibold text-white mt-[36px]">
          <p>2025. 11. 01(토) - 02(일)</p>
          <p>JBK 컨벤션홀</p>
          <p className="text-[16px] md:text-[25px] text-gray-400">
            서울특별시 강남구 봉은사로 619, B1층
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 md:space-x-8 text-[24px] md:text-[35px] font-semibold mt-[42px]">
          <div className="flex justify-center gap-7">
            <div>
              <div>1부 / 3부</div>
              <div>2부 / 4부</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[#ea5514]">10AM ~ 2PM</div>
              <div className="text-[#ea5514]">3PM ~ 7PM</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
