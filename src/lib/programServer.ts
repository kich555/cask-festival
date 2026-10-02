// 공개 페이지용 프로그램 로더. Supabase 에서 읽고,
// 실패하면 배포 시점 데이터(program2026.ts)로 폴백해 시간표가 비지 않게 한다.
import "server-only"
import { revalidatePath } from "next/cache"
import { type ProgramDay, program2026 } from "@/content/program2026"
import { PROGRAM_TABLE, type ProgramSessionRow, rowsToDays } from "./programRecord"
import { getSupabaseAdmin } from "./supabaseAdmin"

export async function getProgram(): Promise<ProgramDay[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(PROGRAM_TABLE)
      .select("*")
      .order("start_time")
      .order("hall")
    if (error) throw error
    return rowsToDays((data ?? []) as ProgramSessionRow[])
  } catch (e) {
    console.error("[program] Supabase 조회 실패, 파일 폴백 사용:", e)
    return program2026
  }
}

/** 시간표가 들어간 공개 페이지를 즉시 다시 그리게 한다. */
export function revalidateProgram() {
  revalidatePath("/program")
  revalidatePath("/")
}
