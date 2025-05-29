"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ImageStatusIndicatorProps {
  imageUrls: string[]
  className?: string
}

export function ImageStatusIndicator({ imageUrls, className = "" }: ImageStatusIndicatorProps) {
  const [status, setStatus] = useState<{
    loaded: number
    failed: number
    loading: boolean
  }>({
    loaded: 0,
    failed: 0,
    loading: true
  })

  useEffect(() => {
    let mounted = true
    
    const checkImages = async () => {
      if (imageUrls.length === 0) {
        setStatus({ loaded: 0, failed: 0, loading: false })
        return
      }

      setStatus(prev => ({ ...prev, loading: true }))

      const promises = imageUrls.map(url => 
        new Promise<boolean>((resolve) => {
          if (!url || url.trim() === '') {
            resolve(false)
            return
          }

          const img = new window.Image()
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
          img.src = url
          
          // Timeout après 5 secondes
          setTimeout(() => resolve(false), 5000)
        })
      )

      const results = await Promise.all(promises)
      
      if (mounted) {
        const loaded = results.filter(Boolean).length
        const failed = results.length - loaded
        
        setStatus({
          loaded,
          failed,
          loading: false
        })
      }
    }

    checkImages()

    return () => {
      mounted = false
    }
  }, [imageUrls])

  if (status.loading) {
    return (
      <Badge variant="outline" className={`${className} border-blue-200 text-blue-700`}>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Vérification des images...
      </Badge>
    )
  }

  const total = imageUrls.length
  const successRate = total > 0 ? Math.round((status.loaded / total) * 100) : 0

  if (status.failed === 0) {
    return (
      <Badge className={`${className} bg-green-100 text-green-700 border-green-200`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        {status.loaded} images chargées
      </Badge>
    )
  }

  if (status.loaded === 0) {
    return (
      <Badge variant="destructive" className={`${className}`}>
        <AlertCircle className="w-3 h-3 mr-1" />
        {status.failed} images non disponibles
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`${className} border-orange-200 text-orange-700`}>
      <AlertCircle className="w-3 h-3 mr-1" />
      {status.loaded}/{total} images ({successRate}%)
    </Badge>
  )
} 