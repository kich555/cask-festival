"use client"

import Image from "next/image"
import { useState } from "react"
import ImageViewer from "./ImageViewer"

const images = [
  "/2025/DSC_7082.jpg",
  "/2025/DSC_7141.jpg",
  "/2025/DSC_7187.jpg",
  "/2025/DSC_7225.jpg",
  "/2025/DSC_7275.jpg",
  "/2025/DSC_7454.jpg",
  "/2025/DSC_7550.jpg",
  "/2025/DSC_8063.jpg",
  "/2025/DSC_8319.jpg",
  "/2025/DSC_8810.jpg",
  "/2025/DSC_9034.jpg",
  "/2025/DSC_9430.jpg",
]

export default function ImageList() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  return (
    <div className="w-full px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-gray-800"
            onClick={() => setSelectedImageIndex(index)}
          >
            <Image
              src={image}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {selectedImageIndex !== null && (
        <ImageViewer
          images={images}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </div>
  )
}


