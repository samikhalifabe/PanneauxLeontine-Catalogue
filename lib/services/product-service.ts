import type { Product } from "@/types/product"
import { getSharedSupabaseClient } from "@/lib/supabase-client"

export interface ProductsByCategory {
  [category: string]: Product[]
}

export interface CategoryCounts {
  [category: string]: number
}

export class ProductService {
  private static instance: ProductService
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
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
   * Récupère tous les produits groupés par catégorie
   */
  async getProductsByCategory(selectedCategories?: string[]): Promise<ProductsByCategory> {
    const cacheKey = `products-${selectedCategories?.join(',') || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const supabase = await getSharedSupabaseClient()

      let query = supabase
        .from("products")
        .select("*")
        .order("category", { ascending: true })
        
      if (selectedCategories && selectedCategories.length > 0) {
        query = query.in("category", selectedCategories)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching products:", error)
        throw new Error(`Erreur lors de la récupération des produits: ${error.message}`)
      }

      const productsByCategory: ProductsByCategory = {}
      data.forEach((product: any) => {
        const category = product.category || "Non classé"
        if (!productsByCategory[category]) {
          productsByCategory[category] = []
        }
        productsByCategory[category].push(product)
      })

      this.setCache(cacheKey, productsByCategory)
      return productsByCategory
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error)
      throw error
    }
  }

  /**
   * Récupère les catégories disponibles avec leur nombre de produits
   */
  async getCategoriesWithCount(): Promise<CategoryCounts> {
    const cacheKey = 'categories-count'
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const supabase = await getSharedSupabaseClient()
      
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null)

      if (error) {
        console.error("Error fetching categories:", error)
        throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`)
      }

      const categoryCounts: CategoryCounts = {}
      data.forEach((item: { category: string }) => {
        const category = item.category || "Non classé"
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      this.setCache(cacheKey, categoryCounts)
      return categoryCounts
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      throw error
    }
  }

  /**
   * Récupère uniquement la liste des catégories disponibles
   */
  async getAvailableCategories(): Promise<string[]> {
    const cacheKey = 'categories-list'
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const supabase = await getSharedSupabaseClient()
      
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null)

      if (error) {
        console.error("Error fetching categories:", error)
        throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`)
      }

      const categories = [...new Set(data.map((item: { category: string }) => item.category))].sort()
      
      this.setCache(cacheKey, categories)
      return categories as string[]
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      throw error
    }
  }

  /**
   * Récupère un produit par son ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product-${id}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const supabase = await getSharedSupabaseClient()
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Produit non trouvé
        }
        console.error("Error fetching product:", error)
        throw new Error(`Erreur lors de la récupération du produit: ${error.message}`)
      }

      this.setCache(cacheKey, data)
      return data as Product
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error)
      throw error
    }
  }

  /**
   * Recherche de produits avec filtres
   */
  async searchProducts(filters: {
    search?: string
    category?: string
    availability?: boolean
    minPrice?: number
    maxPrice?: number
  }): Promise<Product[]> {
    try {
      const supabase = await getSharedSupabaseClient()
      
      let query = supabase.from("products").select("*")

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,reference_code.ilike.%${filters.search}%`)
      }

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.availability !== undefined) {
        query = query.eq("availability", filters.availability)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte("price_with_tax", filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte("price_with_tax", filters.maxPrice)
      }

      const { data, error } = await query.order("name", { ascending: true })

      if (error) {
        console.error("Error searching products:", error)
        throw new Error(`Erreur lors de la recherche: ${error.message}`)
      }

      return data as Product[]
    } catch (error) {
      console.error("Erreur lors de la recherche de produits:", error)
      throw error
    }
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Vide le cache pour une clé spécifique
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key)
  }
}

// Export d'une instance singleton
export const productService = ProductService.getInstance() 