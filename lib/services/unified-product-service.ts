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
      id: product.id,
      name: product.name,
      name_with_combination: product.name_with_combination,
      short_description: product.short_description,
      description: product.description,
      reference_code: product.reference_code,
      availability: product.available_for_order,
      quantity: product.quantity,
      product_link: product.product_link,
      wholesale_price: product.wholesale_price,
      price_without_tax: product.price_without_tax,
      price_with_tax: product.price_with_tax,
      cover_image: product.cover_image,
      image_2: product.image_2,
      image_3: product.image_3,
      image_4: product.image_4,
      image_5: product.image_5,
      image_urls: product.image_urls,
      category: product.categories || product.category_names,
      created_at: product.created_at,
      updated_at: product.updated_at
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

      if (selectedCategories && selectedCategories.length > 0) {
        // Requête hybride : récupérer les produits soit par JOIN soit par category_names
        const query = `
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
            p.cover_image,
            p.image_2,
            p.image_3,
            p.image_4,
            p.image_5,
            p.image_urls,
            p.short_description,
            p.description,
            p.image_alt,
            p.tags,
            p.category_names,
            p.variant_hash,
            p.created_at,
            p.updated_at,
            COALESCE(STRING_AGG(c.name, ', '), '') as categories
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          WHERE (
            c.name = ANY($1) 
            OR EXISTS (
              SELECT 1 FROM unnest(string_to_array(p.category_names, ',')) AS cat_name
              WHERE trim(cat_name) = ANY($1)
            )
          )
          GROUP BY p.id, p.nom_produit, p.nom_produit_avec_combinaison, p.code_reference, p.external_id, p.disponible_pour_commande, p.quantite, p.lien_produit, p.prix_de_gros, p.prix_final_ht, p.prix_final_ttc, p.cover_image, p.image_2, p.image_3, p.image_4, p.image_5, p.image_urls, p.short_description, p.description, p.image_alt, p.tags, p.category_names, p.variant_hash, p.created_at, p.updated_at
          ORDER BY p.nom_produit
        `
        const result = await client.query(query, [selectedCategories])
        products = result.rows
      } else {
        // Récupérer tous les produits
        const query = `
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
            p.cover_image,
            p.image_2,
            p.image_3,
            p.image_4,
            p.image_5,
            p.image_urls,
            p.short_description,
            p.description,
            p.image_alt,
            p.tags,
            p.category_names,
            p.variant_hash,
            p.created_at,
            p.updated_at,
            COALESCE(STRING_AGG(c.name, ', '), '') as categories
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          GROUP BY p.id, p.nom_produit, p.nom_produit_avec_combinaison, p.code_reference, p.external_id, p.disponible_pour_commande, p.quantite, p.lien_produit, p.prix_de_gros, p.prix_final_ht, p.prix_final_ttc, p.cover_image, p.image_2, p.image_3, p.image_4, p.image_5, p.image_urls, p.short_description, p.description, p.image_alt, p.tags, p.category_names, p.variant_hash, p.created_at, p.updated_at 
          ORDER BY p.nom_produit
        `
        const result = await client.query(query)
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
    const cacheKey = `products-by-category-${selectedCategories?.join(',') || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const client = await this.getClient()
      let products: any[] = []

      if (selectedCategories && selectedCategories.length > 0) {
        // Requête hybride pour récupérer les produits
        const query = `
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
            p.cover_image,
            p.image_2,
            p.image_3,
            p.image_4,
            p.image_5,
            p.image_urls,
            p.short_description,
            p.description,
            p.image_alt,
            p.tags,
            p.category_names,
            p.variant_hash,
            p.created_at,
            p.updated_at,
            COALESCE(STRING_AGG(c.name, ', '), '') as categories
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          WHERE (
            c.name = ANY($1) 
            OR EXISTS (
              SELECT 1 FROM unnest(string_to_array(p.category_names, ',')) AS cat_name
              WHERE trim(cat_name) = ANY($1)
            )
          )
          GROUP BY p.id, p.nom_produit, p.nom_produit_avec_combinaison, p.code_reference, p.external_id, p.disponible_pour_commande, p.quantite, p.lien_produit, p.prix_de_gros, p.prix_final_ht, p.prix_final_ttc, p.cover_image, p.image_2, p.image_3, p.image_4, p.image_5, p.image_urls, p.short_description, p.description, p.image_alt, p.tags, p.category_names, p.variant_hash, p.created_at, p.updated_at
          ORDER BY p.nom_produit
        `
        const result = await client.query(query, [selectedCategories])
        products = result.rows
      } else {
        // Récupérer tous les produits
        const query = `
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
            p.cover_image,
            p.image_2,
            p.image_3,
            p.image_4,
            p.image_5,
            p.image_urls,
            p.short_description,
            p.description,
            p.image_alt,
            p.tags,
            p.category_names,
            p.variant_hash,
            p.created_at,
            p.updated_at,
            COALESCE(STRING_AGG(c.name, ', '), '') as categories
          FROM products p
          LEFT JOIN product_categories pc ON p.id = pc.product_id
          LEFT JOIN categories c ON pc.category_id = c.id
          GROUP BY p.id, p.nom_produit, p.nom_produit_avec_combinaison, p.code_reference, p.external_id, p.disponible_pour_commande, p.quantite, p.lien_produit, p.prix_de_gros, p.prix_final_ht, p.prix_final_ttc, p.cover_image, p.image_2, p.image_3, p.image_4, p.image_5, p.image_urls, p.short_description, p.description, p.image_alt, p.tags, p.category_names, p.variant_hash, p.created_at, p.updated_at 
          ORDER BY p.nom_produit
        `
        const result = await client.query(query)
        products = result.rows
      }
      
      const productsByCategory: ProductsByCategory = {}
      
      products.forEach((productData: any) => {
        let categories: string[] = []
        
        // Combiner les catégories des deux sources
        const joinCategories = productData.categories ? productData.categories.split(', ').filter(Boolean) : []
        const nameCategories = productData.category_names ? 
          productData.category_names.split(',').map((cat: string) => cat.trim()).filter(Boolean) : []
        
        // Fusionner et dédupliquer
        categories = [...new Set([...joinCategories, ...nameCategories])]
        
        if (categories.length === 0) {
          categories = ['Non classé']
        }
        
        // Transformer le produit
        const transformedProduct = this.transformProduct(productData)
        
        categories.forEach(category => {
          if (!productsByCategory[category]) {
            productsByCategory[category] = []
          }
          productsByCategory[category].push(transformedProduct)
        })
      })

      this.setCache(cacheKey, productsByCategory)
      return productsByCategory
    } catch (error) {
      console.error("Erreur lors de la récupération des produits par catégorie:", error)
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
      const client = await this.getClient()
      const categoryCounts: CategoryCounts = {}

      // Compter TOUS les produits par catégorie en utilisant l'approche hybride
      const hybridCountQuery = `
        WITH all_product_categories AS (
          -- Produits via jointures
          SELECT DISTINCT p.id, c.name as category_name
          FROM products p
          JOIN product_categories pc ON p.id = pc.product_id
          JOIN categories c ON pc.category_id = c.id
          WHERE LOWER(c.name) != 'accueil'
          
          UNION
          
          -- Produits via category_names
          SELECT DISTINCT p.id, trim(cat_name) as category_name
          FROM products p,
          unnest(string_to_array(p.category_names, ',')) AS cat_name
          WHERE p.category_names IS NOT NULL AND p.category_names != ''
            AND trim(cat_name) != ''
            AND LOWER(trim(cat_name)) != 'accueil'
        )
        SELECT category_name, COUNT(DISTINCT id) as count
        FROM all_product_categories
        WHERE category_name IS NOT NULL AND category_name != ''
        GROUP BY category_name
        ORDER BY count DESC
      `
      
      const result = await client.query(hybridCountQuery)
      
      result.rows.forEach((row: any) => {
        categoryCounts[row.category_name] = parseInt(row.count)
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
      
      // Structure commune pour les deux providers - exclure la catégorie "accueil"
      const result = await client.query(`
        SELECT name FROM categories 
        WHERE LOWER(name) != 'accueil'
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
          p.cover_image,
          p.image_2,
          p.image_3,
          p.image_4,
          p.image_5,
          p.image_urls,
          p.short_description,
          p.description,
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
        GROUP BY p.id, p.nom_produit, p.nom_produit_avec_combinaison, p.code_reference, p.external_id, p.disponible_pour_commande, p.quantite, p.lien_produit, p.prix_de_gros, p.prix_final_ht, p.prix_final_ttc, p.cover_image, p.image_2, p.image_3, p.image_4, p.image_5, p.image_urls, p.short_description, p.description, p.image_alt, p.tags, p.category_names, p.variant_hash, p.created_at, p.updated_at
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
          p.cover_image,
          p.image_2,
          p.image_3,
          p.image_4,
          p.image_5,
          p.image_urls,
          p.short_description,
          p.description,
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

  /**
   * Récupère le nombre total unique de produits (sans doublons entre catégories)
   */
  async getTotalUniqueProductsCount(): Promise<number> {
    const cacheKey = 'total-unique-products-count'
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const client = await this.getClient()
      
      const result = await client.query(`
        SELECT COUNT(DISTINCT id) as count
        FROM products
      `)
      
      const count = parseInt(result.rows[0].count)
      this.setCache(cacheKey, count)
      return count
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre total de produits:", error)
      throw error
    }
  }

  /**
   * Récupère le nombre unique de produits pour les catégories sélectionnées
   */
  async getUniqueProductsCountForCategories(selectedCategories?: string[]): Promise<number> {
    if (!selectedCategories || selectedCategories.length === 0) {
      return this.getTotalUniqueProductsCount()
    }

    const cacheKey = `unique-products-count-${selectedCategories.sort().join(',')}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey)
    }

    try {
      const client = await this.getClient()
      
      const query = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE (
          c.name = ANY($1) 
          OR EXISTS (
            SELECT 1 FROM unnest(string_to_array(p.category_names, ',')) AS cat_name
            WHERE trim(cat_name) = ANY($1)
          )
        )
      `
      
      const result = await client.query(query, [selectedCategories])
      const count = parseInt(result.rows[0].count)
      
      this.setCache(cacheKey, count)
      return count
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de produits pour les catégories:", error)
      throw error
    }
  }
} 