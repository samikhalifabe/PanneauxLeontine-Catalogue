import { useState, useEffect, useCallback } from "react"
import { productService, type ProductsByCategory, type CategoryCounts } from "@/lib/services/product-service"

interface UseCatalogueState {
  productsByCategory: ProductsByCategory
  availableCategories: string[]
  categoryCounts: CategoryCounts
  selectedCategories: string[]
  isLoading: boolean
  error: string | null
}

interface UseCatalogueActions {
  setSelectedCategories: (categories: string[]) => void
  loadCategoriesData: (categories: string[]) => Promise<void>
  refreshData: () => Promise<void>
  clearError: () => void
}

interface UseCatalogueOptions {
  initialCategoriesCount?: number
  autoLoad?: boolean
}

export function useCatalogue(options: UseCatalogueOptions = {}): UseCatalogueState & UseCatalogueActions {
  const { initialCategoriesCount = 3, autoLoad = true } = options

  const [state, setState] = useState<UseCatalogueState>({
    productsByCategory: {},
    availableCategories: [],
    categoryCounts: {},
    selectedCategories: [],
    isLoading: true,
    error: null
  })

  // Fonction pour charger les catégories initiales
  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Charger les catégories et leurs compteurs en parallèle
      const [categories, counts] = await Promise.all([
        productService.getAvailableCategories(),
        productService.getCategoriesWithCount()
      ])

      // Sélectionner les premières catégories par défaut
      const initialCategories = categories.slice(0, initialCategoriesCount)
      
      // Charger les produits des catégories sélectionnées
      const products = await productService.getProductsByCategory(initialCategories)

      setState(prev => ({
        ...prev,
        availableCategories: categories,
        categoryCounts: counts,
        selectedCategories: initialCategories,
        productsByCategory: products,
        isLoading: false
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données"
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      console.error("Erreur dans useCatalogue:", err)
    }
  }, [initialCategoriesCount])

  // Fonction pour charger les produits de nouvelles catégories
  const loadCategoriesData = useCallback(async (newSelectedCategories: string[]) => {
    try {
      // Identifier les nouvelles catégories à charger
      const categoriesToLoad = newSelectedCategories.filter(
        cat => !Object.keys(state.productsByCategory).includes(cat)
      )

      if (categoriesToLoad.length > 0) {
        const newProducts = await productService.getProductsByCategory(categoriesToLoad)
        setState(prev => ({
          ...prev,
          productsByCategory: { ...prev.productsByCategory, ...newProducts }
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des nouvelles catégories"
      setState(prev => ({ ...prev, error: errorMessage }))
      console.error("Erreur lors du chargement des nouvelles catégories:", err)
    }
  }, [state.productsByCategory])

  // Fonction pour définir les catégories sélectionnées
  const setSelectedCategories = useCallback(async (newSelectedCategories: string[]) => {
    setState(prev => ({ ...prev, selectedCategories: newSelectedCategories }))
    await loadCategoriesData(newSelectedCategories)
  }, [loadCategoriesData])

  // Fonction pour rafraîchir toutes les données
  const refreshData = useCallback(async () => {
    // Vider le cache pour forcer le rechargement
    productService.clearCache()
    await loadInitialData()
  }, [loadInitialData])

  // Fonction pour effacer l'erreur
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Chargement initial
  useEffect(() => {
    if (autoLoad) {
      loadInitialData()
    }
  }, [loadInitialData, autoLoad])

  return {
    // État
    productsByCategory: state.productsByCategory,
    availableCategories: state.availableCategories,
    categoryCounts: state.categoryCounts,
    selectedCategories: state.selectedCategories,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    setSelectedCategories,
    loadCategoriesData,
    refreshData,
    clearError
  }
}

// Hook spécialisé pour la recherche de produits
export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchProducts = useCallback(async (filters: {
    search?: string
    category?: string
    availability?: boolean
    minPrice?: number
    maxPrice?: number
  }) => {
    try {
      setIsSearching(true)
      setSearchError(null)
      
      const results = await productService.searchProducts(filters)
      setSearchResults(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la recherche"
      setSearchError(errorMessage)
      console.error("Erreur de recherche:", err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])

  return {
    searchResults,
    isSearching,
    searchError,
    searchProducts,
    clearSearch
  }
} 