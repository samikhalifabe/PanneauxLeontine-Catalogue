"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { CatalogueTable } from "@/components/catalogue-table"
import { Button } from "@/components/ui/button"
import { Printer, CheckSquare, Square, Filter, Search, X, Star, Loader2, Bookmark } from "lucide-react"
import type { Product } from "@/types/product"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageStatusIndicator } from "@/components/image-status-indicator"
import { PdfDownloadButton } from "@/components/pdf-download-button"
import { Input } from "@/components/ui/input"

interface CatalogueTableWithSelectorProps {
  productsByCategory: Record<string, Product[]>
  categories: string[]
  categoryCounts?: Record<string, number>
  selectedCategories?: string[]
  onCategorySelectionChange?: (selectedCategories: string[]) => void
}

export function CatalogueTableWithSelector({ 
  productsByCategory, 
  categories, 
  categoryCounts = {},
  selectedCategories: externalSelectedCategories,
  onCategorySelectionChange 
}: CatalogueTableWithSelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(externalSelectedCategories || categories.slice(0, 3)) // Par défaut, seulement 3 catégories
  )
  const [categorySearch, setCategorySearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set<string>())
  
  // Refs pour les timeouts et debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const updateQueueRef = useRef<Array<() => void>>([])

  // Calculer les images des produits sélectionnés pour le statut
  const selectedImages = useMemo(() => {
    const images: string[] = []
    Array.from(selectedCategories).forEach(category => {
      const products = productsByCategory[category] || []
      products.forEach(product => {
        if (product.cover_image && product.cover_image.trim() !== '') {
          images.push(product.cover_image)
        }
      })
    })
    return images
  }, [selectedCategories, productsByCategory])

  // Synchroniser avec les catégories externes si fournies
  useEffect(() => {
    if (externalSelectedCategories) {
      setSelectedCategories(new Set(externalSelectedCategories))
    }
  }, [externalSelectedCategories])

  // Catégories populaires (les plus grandes)
  const popularCategories = useMemo(() => {
    // Mettre "Fin de stock - OUTLET" en priorité si elle existe
    const outletCategory = categories.find(cat => cat === "Fin de stock - OUTLET")
    
    // Trier les autres catégories par nombre de produits
    const otherCategories = categories
      .filter(cat => cat !== outletCategory)
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))
      .slice(0, outletCategory ? 5 : 6) // 5 autres si outlet existe, sinon 6
    
    // Retourner fin de stock en premier, puis les autres
    return outletCategory ? [outletCategory, ...otherCategories] : otherCategories
  }, [categories, categoryCounts])

  // Filtrer les catégories par recherche
  const filteredCategories = useMemo(() => {
    let categoriesToShow = categories
    
    if (categorySearch) {
      categoriesToShow = categories.filter(category => 
        category.toLowerCase().includes(categorySearch.toLowerCase())
      )
    }
    
    // Trier les catégories avec priorités :
    // 1. "Fin de stock - OUTLET" en premier
    // 2. Catégories populaires ensuite
    // 3. Reste par ordre alphabétique
    return categoriesToShow.sort((a, b) => {
      const outletCategory = "Fin de stock - OUTLET"
      
      // "Fin de stock - OUTLET" en premier
      if (a === outletCategory) return -1
      if (b === outletCategory) return 1
      
      // Ensuite les catégories populaires (en excluant outlet qui est déjà en premier)
      const aIsPopular = popularCategories.includes(a) && a !== outletCategory
      const bIsPopular = popularCategories.includes(b) && b !== outletCategory
      
      if (aIsPopular && !bIsPopular) return -1
      if (!aIsPopular && bIsPopular) return 1
      
      // Si les deux sont populaires, les trier par nombre de produits (décroissant)
      if (aIsPopular && bIsPopular) {
        return (categoryCounts[b] || 0) - (categoryCounts[a] || 0)
      }
      
      // Pour le reste, tri alphabétique
      return a.localeCompare(b)
    })
  }, [categories, categorySearch, popularCategories, categoryCounts])

  // Filtrer les produits par recherche avec memoization
  const filterProductsBySearch = useCallback((products: Product[]) => {
    if (!productSearch) return products
    const searchTerm = productSearch.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchTerm)) ||
      product.reference_code.toLowerCase().includes(searchTerm)
    )
  }, [productSearch])

  // Fonction de debounce pour les mises à jour
  const debouncedUpdate = useCallback((updateFn: () => void) => {
    updateQueueRef.current.push(updateFn)
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setIsUpdating(true)
      
      // Exécuter toutes les mises à jour en queue
      const updates = updateQueueRef.current.splice(0, updateQueueRef.current.length)
      
      // Utiliser requestAnimationFrame pour de meilleures performances
      requestAnimationFrame(() => {
        updates.forEach(update => update())
        
        // Délai minimal pour laisser l'UI se mettre à jour
        setTimeout(() => {
          setIsUpdating(false)
        }, 50)
      })
    }, 100) // Debounce de 100ms
  }, [])

  // Fonction optimisée pour basculer une catégorie
  const handleCategoryToggle = useCallback((category: string, checked: boolean) => {
    if (isUpdating) return
    
    const categoryCount = categoryCounts[category] || productsByCategory[category]?.length || 0
    
    // Ajouter la catégorie aux catégories en cours de chargement si elle est grande
    if (categoryCount > 200) {
      setLoadingCategories(prev => new Set([...prev, category]))
    }
    
    debouncedUpdate(() => {
      const newSelection = new Set(selectedCategories)
      if (checked) {
        newSelection.add(category)
      } else {
        newSelection.delete(category)
      }
      
      setSelectedCategories(newSelection)
      onCategorySelectionChange?.(Array.from(newSelection))
      
      // Retirer de la liste des catégories en chargement
      setLoadingCategories(prev => {
        const newSet = new Set(prev)
        newSet.delete(category)
        return newSet
      })
    })
  }, [selectedCategories, onCategorySelectionChange, categoryCounts, productsByCategory, isUpdating, debouncedUpdate])

  // Fonctions optimisées avec useCallback et debouncing
  const selectAllCategories = useCallback(() => {
    if (isUpdating) return
    setIsUpdating(true)
    
    // Délai plus court pour les actions globales
    setTimeout(() => {
      const newSelection = new Set(categories)
      setSelectedCategories(newSelection)
      onCategorySelectionChange?.(Array.from(newSelection))
      setIsUpdating(false)
    }, 50)
  }, [categories, onCategorySelectionChange, isUpdating])

  const deselectAllCategories = useCallback(() => {
    if (isUpdating) return
    setIsUpdating(true)
    
    setTimeout(() => {
      const newSelection = new Set<string>()
      setSelectedCategories(newSelection)
      onCategorySelectionChange?.(Array.from(newSelection))
      setIsUpdating(false)
    }, 50)
  }, [onCategorySelectionChange, isUpdating])

  const selectPopularCategories = useCallback(() => {
    if (isUpdating) return
    setIsUpdating(true)
    
    setTimeout(() => {
      const newSelection = new Set(popularCategories)
      setSelectedCategories(newSelection)
      onCategorySelectionChange?.(Array.from(newSelection))
      setIsUpdating(false)
    }, 50)
  }, [popularCategories, onCategorySelectionChange, isUpdating])

  const handlePrint = useCallback(() => {
    setTimeout(() => {
      window.print()
    }, 500)
  }, [])

  // Nettoyer les timeouts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Calculer le nombre de catégories sélectionnées
  const selectedCount = selectedCategories.size
  const totalCount = categories.length
  const totalProducts = useMemo(() => {
    const uniqueProductIds = new Set<string>()
    
    selectedCategories.forEach(category => {
      const products = productsByCategory[category] || []
      products.forEach(product => {
        uniqueProductIds.add(product.id.toString())
      })
    })
    
    return uniqueProductIds.size
  }, [productsByCategory, selectedCategories])

  // Calculer le nombre de produits visibles après recherche avec memoization
  const visibleProducts = useMemo(() => {
    return Array.from(selectedCategories).reduce((sum, category) => {
      const products = productsByCategory[category] || []
      const filteredProducts = filterProductsBySearch(products)
      return sum + filteredProducts.length
    }, 0)
  }, [selectedCategories, productsByCategory, filterProductsBySearch])

  // Composant de catégorie memoized pour éviter les re-rendus inutiles
  const CategoryItem = useCallback(({ category }: { category: string }) => {
    const count = categoryCounts[category] || productsByCategory[category]?.length || 0
    const isSelected = selectedCategories.has(category)
    const isPopular = popularCategories.includes(category)
    const isLoading = loadingCategories.has(category)
    
    return (
      <div 
        key={category} 
        className={`flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-slate-50 ${
          isSelected 
            ? (isPopular ? 'border-amber-300 bg-amber-50/50' : 'border-primary/30 bg-primary/5')
            : (isPopular ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50' : 'border-slate-200')
        } ${(isUpdating || isLoading) ? 'pointer-events-none' : ''} ${isLoading ? 'opacity-60' : ''}`}
        onClick={() => !(isUpdating || isLoading) && handleCategoryToggle(category, !isSelected)}
      >
        <Checkbox
          checked={isSelected}
          className={`${isPopular 
            ? 'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500' 
            : 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
          } flex-shrink-0`}
          disabled={isUpdating || isLoading}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1 flex-wrap">
            <Label className={`cursor-pointer text-xs sm:text-sm font-medium leading-tight break-words hyphens-auto ${
              isPopular ? 'text-amber-900 font-semibold' : 'text-gray-900'
            }`}>
              {category}
            </Label>
            {isPopular && (
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
            )}
            {isLoading && (
              <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary animate-spin flex-shrink-0 mt-0.5" />
            )}
          </div>
          <span className={`text-xs ${isPopular ? 'text-amber-600' : 'text-gray-500'}`}>
            {count} produits
            {count > 500 && <span className="text-orange-500 font-medium"> (Grande catégorie)</span>}
          </span>
        </div>
      </div>
    )
  }, [selectedCategories, popularCategories, loadingCategories, categoryCounts, productsByCategory, isUpdating, handleCategoryToggle])

  return (
    <>
      {/* Filtre compact et sticky - toujours ouvert */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/50 print:hidden">
        <div className="container py-3 sm:py-4">
          {/* Barre de contrôle compact */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 flex-shrink-0">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    Filtres et recherche
                    {(isUpdating || loadingCategories.size > 0) && (
                      <Loader2 className="inline-block ml-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin text-primary" />
                    )}
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <span>{selectedCount}/{totalCount} catégories</span>
                    <span>•</span>
                    <span>{productSearch ? visibleProducts : totalProducts} produits</span>
                    {(isUpdating || loadingCategories.size > 0) && (
                      <span className="text-primary text-xs font-medium hidden sm:inline">
                        {loadingCategories.size > 0 ? `Chargement (${loadingCategories.size})...` : 'Mise à jour...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions d'impression */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                onClick={handlePrint} 
                size="sm" 
                className="h-8 px-3 sm:px-4 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                disabled={isUpdating || loadingCategories.size > 0}
              >
                <Printer className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Imprimer</span>
                <span className="sm:hidden">Imprimer</span>
              </Button>
              <PdfDownloadButton 
                documentTitle="Catalogue Panneaux Léontine" 
                size="sm" 
                className="h-8 px-3 sm:px-4 text-xs sm:text-sm" 
              />
            </div>
          </div>

          {/* Panel de filtrage - toujours visible */}
          <div className="p-3 sm:p-4 bg-slate-50/50 rounded-xl border border-slate-200/50 space-y-4 sm:space-y-6">
            {/* Section filtres de catégories */}
            <div className="space-y-3 sm:space-y-4">
              {/* Contrôles de sélection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Bookmark className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">Catégories disponibles</span>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {categories.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllCategories}
                    disabled={isUpdating}
                    className="text-xs h-7 px-2 sm:h-8 sm:px-3 sm:text-sm"
                  >
                    <CheckSquare className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Tout sélectionner</span>
                    <span className="sm:hidden">Tout</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllCategories}
                    disabled={isUpdating}
                    className="text-xs h-7 px-2 sm:h-8 sm:px-3 sm:text-sm"
                  >
                    <Square className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Tout désélectionner</span>
                    <span className="sm:hidden">Aucun</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectPopularCategories}
                    disabled={isUpdating}
                    className="text-xs h-7 px-2 sm:h-8 sm:px-3 sm:text-sm"
                  >
                    <Star className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Populaires</span>
                    <span className="sm:hidden">Populaires</span>
                  </Button>
                </div>
              </div>

              {/* Toutes les catégories avec populaires mises en avant */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Catégories disponibles {categorySearch && `(${filteredCategories.length} résultats)`}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3 w-3" fill="currentColor" />
                      <span>Populaires</span>
                    </div>
                  </div>
                  {categorySearch && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCategorySearch("")} 
                      className="h-6 px-2 text-xs"
                      disabled={isUpdating}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Effacer
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <CategoryItem key={category} category={category} />
                  ))}
                </div>
              </div>
            </div>

            {/* Séparateur entre filtres catégories et recherche produits */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-gray-500 bg-slate-50 px-2 py-1 rounded">RECHERCHE DANS LES PRODUITS</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
            )}

            {/* Section recherche de produits */}
            {selectedCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Rechercher dans les produits sélectionnés</span>
                  {productSearch && (
                    <Badge variant="secondary" className="text-xs">
                      {visibleProducts} résultat{visibleProducts > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un produit par nom, description ou référence..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-12 pr-10 h-10 bg-white border-gray-200 focus:border-primary rounded-lg"
                    disabled={isUpdating}
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table des matières pour la version imprimée */}
      <div className="mb-8 print:mb-12 hidden print:block">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Table des matières</h2>
        <ul className="columns-2 sm:columns-3 gap-8">
          {categories
            .filter((category) => selectedCategories.has(category))
            .map((category) => {
              const count = categoryCounts[category] || productsByCategory[category]?.length || 0
              
              return (
                <li key={category} className="mb-2">
                  <a href={`#category-${category.replace(/\s+/g, "-").toLowerCase()}`} className="hover:text-primary">
                    {category} ({count})
                  </a>
                </li>
              )
            })}
        </ul>
      </div>

      {/* Contenu du catalogue */}
      <div id="catalogue-content" className="space-y-10">
        {selectedCategories.size === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Filter className="h-10 w-10 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-display font-semibold text-gray-900">Aucune catégorie sélectionnée</p>
                <p className="text-gray-600 max-w-md">
                  Sélectionnez des catégories avec les filtres ci-dessus pour consulter les produits.
                </p>
              </div>
              <Button 
                onClick={selectPopularCategories}
                className="mt-4 bg-primary hover:bg-primary/90"
                disabled={isUpdating}
              >
                <Star className="mr-2 h-4 w-4" />
                Voir les catégories populaires
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Indicateur de chargement global */}
            {(isUpdating || loadingCategories.size > 0) && (
              <div className="flex items-center justify-center py-8 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 text-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">
                    {loadingCategories.size > 0 
                      ? `Chargement des catégories (${loadingCategories.size} en cours)...`
                      : 'Mise à jour du catalogue en cours...'
                    }
                  </span>
                </div>
              </div>
            )}
            
            {categories
              .filter((category) => selectedCategories.has(category))
              .map((category, index) => {
                const allProducts = productsByCategory[category] || []
                const filteredProducts = filterProductsBySearch(allProducts)
                
                // Ne pas afficher la catégorie si aucun produit ne correspond à la recherche
                if (productSearch && filteredProducts.length === 0) {
                  return null
                }
                
                return (
                  <section
                    key={category}
                    id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                    className="print:break-inside-avoid-page animate-fade-in scroll-mt-32"
                    style={{ animationDelay: `${index * 50}ms` }} // Réduire le délai d'animation
                  >
                    <div className="flex items-center justify-between mb-6 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-3 h-8 bg-gradient-to-b from-primary to-primary/70 rounded-full print:hidden flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 print:text-black print:bg-primary print:text-white print:p-3 print:mt-8">
                            {category}
                            {loadingCategories.has(category) && (
                              <Loader2 className="inline-block ml-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary print:hidden" />
                            )}
                          </h2>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 print:hidden">
                            <p className="text-sm text-gray-600">
                              {productSearch 
                                ? `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}`
                                : 'Explorez notre sélection de produits dans cette catégorie'
                              }
                            </p>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-white border-primary/30 text-primary font-medium w-fit">
                              {filteredProducts.length} / {allProducts.length} produit{allProducts.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 print:hidden flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${loadingCategories.has(category) ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden print:border-0 print:shadow-none print:rounded-none hover:shadow-xl transition-shadow duration-300">
                      <CatalogueTable products={filteredProducts} />
                    </div>
                  </section>
                )
              })
            }
          </>
        )}
      </div>
    </>
  )
}
