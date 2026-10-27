// /exhibitor 자료실 — 업체별 참가확인서 (Supabase 비공개 버킷, lib/exhibitorCertificates)

import { formatSize, listCertificates } from "@/lib/exhibitorCertificates"
import { OFFICE_CONTACT } from "@/lib/exhibitorRecord"
import { SectionLabel } from "./BrandGuide"
import { ItemBtn } from "./DesignAssets"

export default async function Certificates({ loginId }: { loginId: string }) {
  const files = await listCertificates(loginId)
  return (
    <div className="bg-white border border-black/10 rounded-lg px-6 md:px-10 py-8 mb-6">
      <SectionLabel en="Certificate" ko="참가확인서" />
      {files.length === 0 ? (
        <div className="text-[14px] text-[#888] leading-relaxed">
          <p>참가확인서가 업로드되어 있지 않다면 운영사무국으로 연락 부탁드립니다.</p>
          <p className="mt-2 text-[#555]">
            <a href={`tel:${OFFICE_CONTACT.phone.replace(/-/g, "")}`} className="hover:underline">
              {OFFICE_CONTACT.phone}
            </a>
            <span className="mx-2 text-black/20">|</span>
            <a href={`mailto:${OFFICE_CONTACT.email}`} className="hover:underline">
              {OFFICE_CONTACT.email}
            </a>
          </p>
        </div>
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
