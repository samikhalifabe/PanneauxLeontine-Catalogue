import type { Product } from "@/types/product"
import { getDatabaseClient, DatabaseClient } from "@/lib/database-clients"
import { getDatabaseConfig } from "@/lib/database-config"

export interface ProductsByCategory {
  [category: string]: Product[]
}

export interface CategoryCounts {
  [category: string]: number
}

export class UnifiedProductService {
  private static instance: UnifiedProductService
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private dbClient: DatabaseClient | null = null

  static getInstance(): UnifiedProductService {
    if (!UnifiedProductService.instance) {
      UnifiedProductService.instance = new UnifiedProductService()
    }
    return UnifiedProductService.instance
  }

  private async getClient(): Promise<DatabaseClient> {
    if (!this.dbClient) {
      this.dbClient = await getDatabaseClient()
    }
    return this.dbClient
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
   * Transforme les données de la base (colonnes françaises) vers l'interface Product (anglais)
   */
  private transformProduct(product: any): Product {
    return {
      ...product,
      // Transformer les noms de colonnes françaises vers l'interface anglaise
      availability: product.available_for_order,
      // Supprimer les champs temporaires
      available_for_order: undefined
    }
  }

  /**
   * Récupère tous les produits avec leurs catégories
   */
  async getProductsWithCategories(selectedCategories?: string[]): Promise<Product[]> {
    const cacheKey = `products-with-categories-${selectedCategories?.join(',') || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const client = await this.getClient()
      let products: any[] = []

      // Structure commune pour Neon et Supabase (avec colonnes françaises)
      let query = `
        SELECT 
          p.id,
          p.nom_produit as name,
          p.nom_produit_avec_combinaison as name_with_combination,
          p.code_reference as reference_code,
          p.external_id,
          p.disponible_pour_commande as available_for_order,
          p.quantite as quantity,
          p.lien_produit as product_link,
          p.prix_de_gros as wholesale_price,
          p.prix_final_ht as price_without_tax,
          p.prix_final_ttc as price_with_tax,
          p.image_url as cover_image,
          p.image_alt,
          p.tags,
          p.category_names,
          p.variant_hash,
          p.created_at,
          p.updated_at,
          STRING_AGG(c.name, ', ') as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
      `

      if (selectedCategories && selectedCategories.length > 0) {
        query += ` WHERE c.name = ANY($1)`
        const result = await client.query(query + ' GROUP BY p.id ORDER BY p.nom_produit', [selectedCategories])
        products = result.rows
      } else {
        const result = await client.query(query + ' GROUP BY p.id ORDER BY p.nom_produit')
        products = result.rows
      }

      // Transformer les données pour correspondre à l'interface Product
      const transformedProducts = products.map(product => this.transformProduct(product))

      this.setCache(cacheKey, transformedProducts)
      return transformedProducts
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error)
      throw error
    }
  }

  /**
   * Récupère tous les produits groupés par catégorie
   */
  async getProductsByCategory(selectedCategories?: string[]): Promise<ProductsByCategory> {
    const products = await this.getProductsWithCategories(selectedCategories)
    
    const productsByCategory: ProductsByCategory = {}
    
    products.forEach((product: any) => {
      let categories: string[] = []
      
      // Utiliser les catégories jointes ou category_names comme fallback
      if (product.categories) {
        categories = product.categories.split(', ').filter(Boolean)
      } else if (product.category_names) {
        categories = product.category_names.split(',').map((cat: string) => cat.trim()).filter(Boolean)
      }
      
      if (categories.length === 0) {
        categories = ['Non classé']
      }
      
      categories.forEach(category => {
        if (!productsByCategory[category]) {
          productsByCategory[category] = []
        }
        productsByCategory[category].push(product)
      })
    })

    return productsByCategory
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
      const client = await this.getClient()
      const categoryCounts: CategoryCounts = {}

      // Structure commune pour les deux providers
      const result = await client.query(`
        SELECT c.name, COUNT(pc.product_id) as count
        FROM categories c
        LEFT JOIN product_categories pc ON c.id = pc.category_id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `)
      
      result.rows.forEach((row: any) => {
        categoryCounts[row.name] = parseInt(row.count)
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
      const client = await this.getClient()
      
      // Structure commune pour les deux providers
      const result = await client.query(`
        SELECT name FROM categories 
        ORDER BY name
      `)
      const categories = result.rows.map((row: any) => row.name)

      this.setCache(cacheKey, categories)
      return categories
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
      const client = await this.getClient()

      // Structure commune pour les deux providers
      const result = await client.query(`
        SELECT 
          p.id,
          p.nom_produit as name,
          p.nom_produit_avec_combinaison as name_with_combination,
          p.code_reference as reference_code,
          p.external_id,
          p.disponible_pour_commande as available_for_order,
          p.quantite as quantity,
          p.lien_produit as product_link,
          p.prix_de_gros as wholesale_price,
          p.prix_final_ht as price_without_tax,
          p.prix_final_ttc as price_with_tax,
          p.image_url as cover_image,
          p.image_alt,
          p.tags,
          p.category_names,
          p.variant_hash,
          p.created_at,
          p.updated_at,
          STRING_AGG(c.name, ', ') as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id])
      
      if (result.rows.length === 0) return null
      
      const product = this.transformProduct(result.rows[0])
      this.setCache(cacheKey, product)
      return product
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
    categories?: string[]
    availability?: boolean
    minPrice?: number
    maxPrice?: number
  }): Promise<Product[]> {
    const cacheKey = `search-${JSON.stringify(filters)}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const client = await this.getClient()
      
      // Structure commune pour les deux providers
      let query = `
        SELECT DISTINCT
          p.id,
          p.nom_produit as name,
          p.nom_produit_avec_combinaison as name_with_combination,
          p.code_reference as reference_code,
          p.external_id,
          p.disponible_pour_commande as available_for_order,
          p.quantite as quantity,
          p.lien_produit as product_link,
          p.prix_de_gros as wholesale_price,
          p.prix_final_ht as price_without_tax,
          p.prix_final_ttc as price_with_tax,
          p.image_url as cover_image,
          p.image_alt,
          p.tags,
          p.category_names,
          p.variant_hash,
          p.created_at,
          p.updated_at
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE 1=1
      `
      
      const params: any[] = []
      let paramCount = 0

      if (filters.search) {
        paramCount++
        query += ` AND (p.nom_produit ILIKE $${paramCount} OR p.code_reference ILIKE $${paramCount})`
        params.push(`%${filters.search}%`)
      }

      if (filters.categories && filters.categories.length > 0) {
        paramCount++
        query += ` AND c.name = ANY($${paramCount})`
        params.push(filters.categories)
      }

      if (filters.availability !== undefined) {
        paramCount++
        query += ` AND p.disponible_pour_commande = $${paramCount}`
        params.push(filters.availability)
      }

      if (filters.minPrice !== undefined) {
        paramCount++
        query += ` AND p.prix_final_ttc >= $${paramCount}`
        params.push(filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        paramCount++
        query += ` AND p.prix_final_ttc <= $${paramCount}`
        params.push(filters.maxPrice)
      }

      query += ` ORDER BY p.nom_produit`

      const result = await client.query(query, params)
      
      // Transformer les données pour correspondre à l'interface Product
      const products = result.rows.map(product => this.transformProduct(product))

      this.setCache(cacheKey, products)
      return products
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
    console.log("Cache vidé")
  }

  /**
   * Vide une clé spécifique du cache
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Reset le client de base de données (utile pour changer de provider)
   */
  resetDatabaseClient(): void {
    this.dbClient = null
  }
} 