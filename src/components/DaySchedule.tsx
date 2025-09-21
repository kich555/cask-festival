/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import type { Session } from "./MasterClassSection"
import SessionCard from "./SessionCard"

// 하루 스케줄 컴포넌트 - 시간대별 행으로 구성
export type DayScheduleProps = {
  dayLabel: string
  sessions: Array<{
    time?: string
    loungeA: Session
    loungeB: Session
  }>
}

export default function DaySchedule({ dayLabel, sessions }: DayScheduleProps) {
  return (
    <div>
      <h3 className="text-[24px] md:text-[32px] font-bold text-center mb-6">{dayLabel}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE A</h4>
        <h4 className="text-[20px] md:text-[24px] text-center font-medium">LOUNGE B</h4>
      </div>
      <div className="space-y-6">
        {sessions.map((timeSlot, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-4 items-center">
            {/* LOUNGE A 세션 */}
            <SessionCard {...timeSlot.loungeA} />
            {/* LOUNGE B 세션 */}
            <SessionCard {...timeSlot.loungeB} />
            <p className="text-[20px] md:text-[24px] text-center font-medium">{timeSlot.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
