/**
 * Utilitaires pour la gestion des images
 */

// Cache pour les images vérifiées
const imageStatusCache = new Map<string, boolean>()

/**
 * Vérifie si une image est accessible sans déclencher d'erreurs Next.js
 */
export async function checkImageAvailability(url: string): Promise<boolean> {
  if (!url || url.trim() === '') return false
  
  // Vérifier le cache d'abord
  if (imageStatusCache.has(url)) {
    return imageStatusCache.get(url)!
  }

  try {
    // Utiliser fetch avec mode 'no-cors' pour éviter les erreurs CORS
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'force-cache'
    })
    
    const isAvailable = response.type === 'opaque' || response.ok
    
    // Mettre en cache le résultat
    imageStatusCache.set(url, isAvailable)
    
    return isAvailable
  } catch {
    // En cas d'erreur, considérer l'image comme non disponible
    imageStatusCache.set(url, false)
    return false
  }
}

/**
 * Génère une URL de placeholder basée sur le contenu
 */
export function generatePlaceholderUrl(
  text: string = 'Image',
  width: number = 300,
  height: number = 300,
  bgColor: string = 'f1f5f9',
  textColor: string = '6b7280'
): string {
  const encodedText = encodeURIComponent(text.substring(0, 20))
  return `/api/placeholder?text=${encodedText}&width=${width}&height=${height}&bg=%23${bgColor}&color=%23${textColor}`
}

/**
 * Retourne l'URL d'image la plus appropriée
 */
export function getSafeImageUrl(
  originalUrl: string,
  fallbackText: string = 'Produit',
  width: number = 300,
  height: number = 300
): string {
  if (!originalUrl || originalUrl.trim() === '') {
    return generatePlaceholderUrl(fallbackText, width, height)
  }
  
  // Pour l'instant, retourner l'URL originale
  // La vérification se fera côté client
  return originalUrl
}

/**
 * Précharge une liste d'images et retourne les statuts
 */
export async function preloadImages(urls: string[]): Promise<{
  loaded: string[]
  failed: string[]
}> {
  const promises = urls.map(async (url) => {
    const isAvailable = await checkImageAvailability(url)
    return { url, success: isAvailable }
  })

  const results = await Promise.all(promises)
  
  return {
    loaded: results.filter(r => r.success).map(r => r.url),
    failed: results.filter(r => !r.success).map(r => r.url)
  }
}

/**
 * Nettoie le cache des images (utile pour les tests)
 */
export function clearImageCache(): void {
  imageStatusCache.clear()
} 