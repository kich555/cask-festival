"use client"

import { useTranslation } from "@/i18n"
import Image from "next/image"
import { Suspense } from "react"

function FooterContent() {
  const { t } = useTranslation()

  return (
    <footer id="footer" className="mt-28">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-between mb-8 px-8">
          <div className="text-center md:text-left">
            <h3 className="hidden md:block text-[28px] md:text-[35px] font-bold text-white">
              {t.footer.contact}
            </h3>
            <div className="flex text-left text-[16px] md:text-[20px] flex-col gap-4 items-start md:gap-10 md:flex-row md:items-center ">
              <div>
                <p className="md:text-[24px] text-white">{t.footer.instagram}</p>
                <p className="md:text-[24px] text-[#ea5514]">@caskcarnival</p>
              </div>
              <div>
                <p className="md:text-[24px] text-white">{t.footer.email}</p>
                <p className="md:text-[24px] text-[#ea5514]">lsy9752@whiskynavi.com</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center md:justify-end">
            <div className="self-end text-[#EA5514] text-center text-[35px] font-black leading-none">
              CASK <br />
              CARNIVAL
            </div>
            <Image src="/hero-icon.png" alt="logo" width={134} height={158} />
          </div>
        </div>
      </div>
      <div className="bg-[#ea5514] py-4 text-center rounded">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:justify-start items-center text-black text-[12px] md:text-[14px] space-y-2 md:space-y-0 mx-10 text-white">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function FooterSection() {
  return (
    <Suspense fallback={null}>
      <FooterContent />
    </Suspense>
  )
}
