import { NextResponse } from "next/server"
import { getFloorPlanPublic } from "@/lib/floorPlanServer"

export const runtime = "nodejs"
// 상단 메뉴가 부스 배치도 공개 여부를 묻는다. 관리자 변경은 revalidatePath 로 즉시 반영
export const revalidate = 60

export async function GET() {
  return NextResponse.json({ public: await getFloorPlanPublic() })
}
