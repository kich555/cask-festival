import type { Sessions } from "./MasterClassSection"
import SessionCard from "./SessionCard"

interface MasterClassDesktopProps {
  sessions: Sessions
}

export default function MasterClassDesktop({ sessions }: MasterClassDesktopProps) {
  return (
    <div className="hidden lg:block">
      <div className="flex justify-center gap-4">
        <div>
          <div className="grid grid-cols-5 gap-4">
            <h3 className="col-span-2 col-start-1 text-[24px] md:text-[32px] font-bold text-center mb-6">
              11.01 (SAT)
            </h3>
            <h3 className="col-span-2 col-start-4 text-[24px] md:text-[32px] font-bold text-center mb-6">
              11.02 (SUN)
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE A</h4>
            <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE B</h4>
            <br />
            <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE A</h4>
            <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE B</h4>
          </div>
          <div className="space-y-6">
            {sessions.map((timeSlot, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-4 items-center">
                <SessionCard {...timeSlot.sat.loungeA} />
                <SessionCard {...timeSlot.sat.loungeB} />
                <p className="text-[20px] md:text-[24px] text-center font-medium">
                  {timeSlot.time}
                </p>
                <SessionCard {...timeSlot.sun.loungeA} />
                <SessionCard {...timeSlot.sun.loungeB} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
