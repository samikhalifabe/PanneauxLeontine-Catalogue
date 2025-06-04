"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: {
    src: string | null | undefined
    alt: string
  }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Filtrer les images valides
  const validImages = images.filter(img => img.src && img.src.trim() !== "")
  const [currentIndex, setCurrentIndex] = useState(0)

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Aucune image disponible</p>
        </div>
      </div>
    )
  }

  const currentImage = validImages[currentIndex]
  const hasMultipleImages = validImages.length > 1

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + validImages.length) % validImages.length)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % validImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square overflow-hidden rounded-lg border">
        <Image
          src={currentImage.src || "/placeholder.svg"}
          alt={currentImage.alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Navigation sur l'image principale si plusieurs images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures si plusieurs images */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                index === currentIndex 
                  ? "border-primary" 
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 