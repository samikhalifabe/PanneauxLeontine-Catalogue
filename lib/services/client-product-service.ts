// Service client pour récupérer les données via les API routes
export interface ProductsByCategory {
  [category: string]: any[]
}

export interface CategoryCounts {
  [category: string]: number
}

export class ClientProductService {
  private static instance: ClientProductService
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ClientProductService {
    if (!ClientProductService.instance) {
      ClientProductService.instance = new ClientProductService()
    }
    return ClientProductService.instance
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.CACHE_TTL
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key)
    return cached?.data
  }

  /**
   * Récupère les catégories et leurs compteurs
   */
  async getCategoriesData(): Promise<{ categories: string[], categoryCounts: CategoryCounts }> {
    const cacheKey = 'categories-data'
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des catégories')
      }

      this.setCache(cacheKey, result.data)
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      throw error
    }
  }

  /**
   * Récupère les produits groupés par catégorie
   */
  async getProductsByCategory(selectedCategories?: string[]): Promise<ProductsByCategory> {
    const cacheKey = `products-${selectedCategories?.join(',') || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const params = new URLSearchParams()
      if (selectedCategories && selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','))
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des produits')
      }

      this.setCache(cacheKey, result.data)
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      throw error
    }
  }

  /**
   * Récupère le nombre unique de produits pour les catégories sélectionnées
   */
  async getUniqueProductsCount(selectedCategories?: string[]): Promise<number> {
    const cacheKey = `unique-count-${selectedCategories?.join(',') || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const params = new URLSearchParams()
      if (selectedCategories && selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','))
      }

      const response = await fetch(`/api/products/count?${params.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération du nombre de produits')
      }

      this.setCache(cacheKey, result.count)
      return result.count
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de produits:', error)
      throw error
    }
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear()
    console.log("Cache vidé")
  }

  /**
   * Vide une clé spécifique du cache
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key)
  }
} 