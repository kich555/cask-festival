// /exhibitor 자료실 — 업체별 참가확인서 (Supabase 비공개 버킷, lib/exhibitorCertificates)

import { formatSize, listCertificates } from "@/lib/exhibitorCertificates"
import { SectionLabel } from "./BrandGuide"
import { ItemBtn } from "./DesignAssets"

export default async function Certificates({ loginId }: { loginId: string }) {
  const files = await listCertificates(loginId)
  return (
    <div className="bg-white border border-black/10 rounded-lg px-6 md:px-10 py-8 mb-6">
      <SectionLabel en="Certificate" ko="참가확인서" />
      {files.length === 0 ? (
        <p className="text-[14px] text-[#888]">참가확인서는 준비되는 대로 이곳에 올라옵니다.</p>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <a
              key={f.name}
              href={`/api/exhibitor/certificate?file=${encodeURIComponent(f.name)}`}
              download
              className="group flex items-center justify-between gap-3 border border-black/10 rounded-lg px-4 py-3 text-[14px]"
            >
              <span className="min-w-0">
                <b className="block truncate">{f.name}</b>
                <span className="block text-[#888] text-[12px]">{formatSize(f.size)}</span>
              </span>
              <ItemBtn />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
