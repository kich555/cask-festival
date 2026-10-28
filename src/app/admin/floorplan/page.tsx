import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import { getFloorBrands, getFloorPlanVisibility, getLayout } from "@/lib/floorPlanServer"
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
  const [layout, brands, visibility] = await Promise.all([
    getLayout(),
    getFloorBrands(),
    getFloorPlanVisibility(),
  ])

  return (
    <>
      <AdminTabs active="floorplan" />
      <FloorPlanAdmin initial={layout} brands={brands} initialVisibility={visibility} />
    </>
  )
}
