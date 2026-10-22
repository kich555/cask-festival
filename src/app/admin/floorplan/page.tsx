import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import { getFloorBrands, getFloorPlanPublic, getLayout } from "@/lib/floorPlanServer"
import AdminLogin from "../AdminLogin"
import AdminTabs from "../AdminTabs"
import FloorPlanAdmin from "./FloorPlanAdmin"

export const metadata: Metadata = {
  title: "부스 배치도 관리",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminFloorPlanPage() {
  if (!(await isAdminRequest())) return <AdminLogin />
  const [layout, brands, isPublic] = await Promise.all([
    getLayout(),
    getFloorBrands(),
    getFloorPlanPublic(),
  ])

  return (
    <>
      <AdminTabs active="floorplan" />
      <FloorPlanAdmin initial={layout} brands={brands} initialPublic={isPublic} />
    </>
  )
}
