import type { Session } from "./MasterClassSection"

export default function SessionCard({ title, subtitle, imageSrc, alt }: Session) {
  return (
    <div className="text-center mb-4">
      {/* 이미지 영역 + 하단 정보 오버레이 */}
      <div className="relative bg-gray-800 h-[250px] md:h-[311px] rounded-lg overflow-hidden">
        {imageSrc ? (
          <img src={imageSrc} alt={alt ?? title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#d7dbdf]">
            <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-[#c2c8ce]" />
          </div>
        )}
        {/* 하단 오버레이 바 */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#2b2b2b]/95 px-4 py-3">
          <div className="text-[20px] md:text-[24px] text-white leading-tight">{title}</div>
          <div className="text-[16px] md:text-[20px] text-[#ea5514] leading-tight">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}
