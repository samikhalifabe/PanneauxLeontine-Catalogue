"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ImageOff, Package } from "lucide-react"

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  productName?: string
  onError?: () => void
}

// Domaines autorisés dans next.config.js
const ALLOWED_DOMAINS = [
  'shop.panneauxleontine.be',
  'via.placeholder.com',
  'placehold.co',
  'example.com',
  'localhost'
]

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false
  
  // Autoriser les URLs locales (commençant par /)
  if (url.startsWith('/')) return true
  
  // Autoriser les data URLs
  if (url.startsWith('data:')) return true
  
  // Vérifier les domaines externes
  try {
    const urlObj = new URL(url)
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname === domain)
  } catch {
    return false
  }
}

export function SafeImage({
  src,
  alt,
  width = 300,
  height = 300,
  fill,
  className = "",
  sizes,
  priority = false,
  quality = 85,
  productName,
  onError
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset des états quand src change
  useEffect(() => {
    setImageError(false)
    setIsLoading(true)
  }, [src])

  const handleImageError = () => {
    console.log(`SafeImage: Erreur de chargement pour ${src}`)
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }

  const handleImageLoad = () => {
    console.log(`SafeImage: Image chargée avec succès ${src}`)
    setIsLoading(false)
  }

  // Déterminer si on peut utiliser Next.js Image
  const canUseNextImage = src && src.trim() !== "" && !imageError && isValidImageUrl(src)

  // Si l'image n'est pas valide ou a échoué, afficher le placeholder
  if (!canUseNextImage) {
    const displayName = productName || alt || "Produit"
    const truncatedName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName
    
    const placeholderStyle = {
      width: fill ? '100%' : width,
      height: fill ? '100%' : height,
    }

    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 rounded-lg ${className}`}
        style={placeholderStyle}
      >
        <div className="text-center p-3">
          <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium leading-tight mb-1">
            {truncatedName}
          </p>
          <p className="text-xs text-slate-400">
            {!src || src.trim() === "" ? "Aucune image" : 
             imageError ? "Erreur de chargement" : 
             "URL non autorisée"}
          </p>
        </div>
      </div>
    )
  }

  const containerStyle = fill ? {} : { width, height }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`} style={containerStyle}>
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-lg flex items-center justify-center`}
        >
          <ImageOff className="h-6 w-6 text-slate-400" />
        </div>
      )}
      
      {/* Image Next.js */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        sizes={sizes}
        priority={priority}
        quality={quality}
        onError={handleImageError}
        onLoad={handleImageLoad}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
        unoptimized={false}
      />
    </div>
  )
}

// Version simplifiée pour l'impression
export function PrintImage({ src, alt, productName }: { src: string, alt: string, productName?: string }) {
  if (!src || src.trim() === "") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
        <div className="text-center p-2">
          <Package className="h-6 w-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600">{productName || alt}</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded"
      onError={(e) => {
        const target = e.target as HTMLImageElement
        const container = target.parentElement
        if (container) {
          container.innerHTML = `
            <div class="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
              <div class="text-center p-2">
                <div class="text-gray-400 mb-1">📦</div>
                <div class="text-xs text-gray-600">${productName || alt}</div>
              </div>
            </div>
          `
        }
      }}
    />
  )
}

// Hook pour précharger et vérifier les images
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const preloadImages = async () => {
    const promises = urls.map(url => 
      new Promise<{ url: string, success: boolean }>((resolve) => {
        if (!url || url.trim() === '') {
          resolve({ url, success: false })
          return
        }

        const img = new window.Image()
        img.onload = () => resolve({ url, success: true })
        img.onerror = () => resolve({ url, success: false })
        img.src = url
      })
    )

    const results = await Promise.all(promises)
    
    const loaded = new Set<string>()
    const failed = new Set<string>()
    
    results.forEach(({ url, success }) => {
      if (success) {
        loaded.add(url)
      } else {
        failed.add(url)
      }
    })
    
    setLoadedImages(loaded)
    setFailedImages(failed)
  }

  return { loadedImages, failedImages, preloadImages }
} 