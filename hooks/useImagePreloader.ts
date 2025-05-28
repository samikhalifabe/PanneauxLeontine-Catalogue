import { useEffect, useCallback, useState } from 'react'

interface UseImagePreloaderProps {
  images: string[]
  priority?: boolean
  delay?: number
}

/**
 * Hook pour précharger intelligemment les images
 * Prioritise les images dans le viewport et diffère les autres
 */
export function useImagePreloader({ 
  images, 
  priority = false, 
  delay = 2000 
}: UseImagePreloaderProps) {
  
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!src || src.startsWith('data:')) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }, [])

  const preloadImages = useCallback(async (imagesToLoad: string[]) => {
    const validImages = imagesToLoad.filter(src => src && !src.startsWith('data:'))
    
    if (validImages.length === 0) return

    try {
      if (priority) {
        // Charger immédiatement les images prioritaires
        await Promise.allSettled(validImages.map(preloadImage))
      } else {
        // Charger les images non-prioritaires avec délai
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Charger par petits lots pour éviter la surcharge
        const batchSize = 3
        for (let i = 0; i < validImages.length; i += batchSize) {
          const batch = validImages.slice(i, i + batchSize)
          await Promise.allSettled(batch.map(preloadImage))
          // Petit délai entre les lots
          if (i + batchSize < validImages.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      }
    } catch (error) {
      console.warn('Error preloading images:', error)
    }
  }, [preloadImage, priority, delay])

  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images)
    }
  }, [images, preloadImages])

  return { preloadImage, preloadImages }
}

/**
 * Hook pour detecter si une image est dans le viewport
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
} 