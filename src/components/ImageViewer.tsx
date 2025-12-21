"use client"

import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect } from "react"

interface ImageViewerProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ImageViewer({ images, currentIndex, onClose, onNavigate }: ImageViewerProps) {
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    onNavigate(newIndex)
  }, [currentIndex, images.length, onNavigate])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    onNavigate(newIndex)
  }, [currentIndex, images.length, onNavigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll when viewer is open
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [onClose, goToPrevious, goToNext])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close viewer"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Previous button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors md:left-8"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      {/* Next button */}
      <button
        onClick={goToNext}
        className="absolute right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors md:right-8"
        aria-label="Next image"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-16"
        onClick={onClose}
      >
        <div
          className="relative w-full h-full max-w-7xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}


