"use client"

import { useTranslation } from "@/i18n"
import Image from "next/image"
import { Suspense, useState } from "react"

function MasterClassMobileContent() {
  const [activeDay, setActiveDay] = useState<"sat" | "sun">("sat")
  const { t } = useTranslation()

  return (
    <div className="lg:hidden relative px-4">
      {/* Day Tabs */}
      <div className="flex gap-4 mb-6 justify-center">
        <button
          type="button"
          onClick={() => setActiveDay("sat")}
          className={`px-6 py-3 text-[18px] md:text-[20px] font-bold rounded-lg transition-all ${
            activeDay === "sat"
              ? "bg-[#ea5514] text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {t.masterClass.sat}
        </button>
        <button
          type="button"
          onClick={() => setActiveDay("sun")}
          className={`px-6 py-3 text-[18px] md:text-[20px] font-bold rounded-lg transition-all ${
            activeDay === "sun"
              ? "bg-[#ea5514] text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {t.masterClass.sun}
        </button>
      </div>

      {/* Timetable Image */}
      <div className="w-full max-w-2xl mx-auto">
        <Image
          src={activeDay === "sat" ? "/time-table-sat-v2.png" : "/time-table-sun-v2.png"}
          alt={`${activeDay === "sat" ? "Saturday" : "Sunday"} Timetable`}
          width={1000}
          height={800}
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

export default function MasterClassMobile() {
  return (
    <Suspense fallback={null}>
      <MasterClassMobileContent />
    </Suspense>
  )
}
