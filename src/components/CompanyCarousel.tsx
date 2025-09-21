/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { useCallback } from "react"

interface Company {
  name: string
  image: string
}

interface CompanyCarouselProps {
  companies: Company[]
}

export default function CompanyCarousel({ companies }: CompanyCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: "start",
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 1 },
    },
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative mt-5">
      {/* Embla Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex my-1">
          {companies.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_20%] min-w-0 pl-4 md:pl-6"
            >
              <div className="group flex h-full flex-col rounded-2xl border border-white/15 bg-[#121212]/70 shadow-md transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#ea5514]/70">
                <div className="relative h-[280px] md:h-[282px] overflow-hidden">
                  <Image
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={company.image}
                    alt={company.name}
                    width={272}
                    height={282}
                  />
                </div>
                <div className="bg-[#121212]/90 my-3 md:my-4">
                  <h3 className="text-[18px] md:text-[24px] font-bold text-[#ea5514] text-center">
                    {company.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={scrollPrev}
          className="text-[#ea5514] cursor-pointer p-2 transition-all duration-300 shadow-lg hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={scrollNext}
          className="text-[#ea5514] cursor-pointer p-2 transition-all duration-300 shadow-lg hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
