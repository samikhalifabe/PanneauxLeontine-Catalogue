"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { SiteHeader } from "@/components/site-header"
import { CatalogueTable } from "@/components/catalogue-table"
import { Button } from "@/components/ui/button"
import { Printer, CheckSquare, Square, Info, Filter, FileText, Loader2 } from "lucide-react"
import type { Product } from "@/types/product"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Importer le bouton de téléchargement PDF
import { PdfDownloadButton } from "@/components/pdf-download-button"
import { ClientProductService } from "@/lib/services/client-product-service"
import type { ProductsByCategory } from "@/lib/services/client-product-service"

// Composant optimisé pour les éléments de catégorie
const CategoryItem = memo(({ 
  category, 
  productCount, 
  isSelected, 
  onToggle 
}: { 
  category: string
  productCount: number
  isSelected: boolean
  onToggle: (category: string, checked: boolean) => void
}) => (
  <div 
    className={`flex items-center p-4 border-b border-gray-50 last:border-b-0 transition-all duration-200 active:bg-gray-50 ${
      isSelected ? 'bg-primary/5' : 'bg-white'
    }`}
    onClick={() => onToggle(category, !isSelected)}
  >
    <div className="flex items-center flex-1 min-w-0 gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        isSelected 
          ? 'bg-primary border-primary' 
          : 'border-gray-300 bg-white'
      }`}>
        {isSelected && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{category}</div>
        <div className="text-xs text-gray-500">{productCount} produit{productCount > 1 ? 's' : ''}</div>
      </div>
    </div>
    
    {isSelected && (
      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center ml-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      </div>
    )}
  </div>
))

CategoryItem.displayName = 'CategoryItem'

// Composant Loader Mobile App Style - Version simplifiée
const MobileAppLoader = memo(({ message = "Mise à jour..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
    <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-xs w-full">
      {/* Spinner simplifié style iOS */}
      <div className="flex justify-center mb-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Message centré */}
      <div className="text-center">
        <p className="font-medium text-gray-900 text-sm mb-3">{message}</p>
        
        {/* Points animés */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
))

MobileAppLoader.displayName = 'MobileAppLoader'

// Loader inline simplifié
const InlineLoader = memo(() => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 relative">
      <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <span className="text-xs text-primary font-medium">Sync</span>
  </div>
))

InlineLoader.displayName = 'InlineLoader'

// Bouton loader
const ButtonSpinner = memo(() => (
  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
))

ButtonSpinner.displayName = 'ButtonSpinner'

export default function CatalogueTableauPage() {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({})
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [loadingStep, setLoadingStep] = useState<string>("Initialisation...")

  // Instance du service client
  const productService = ClientProductService.getInstance()

  // Calculs optimisés avec useMemo
  const selectedCount = useMemo(() => selectedCategories.size, [selectedCategories])
  const totalCount = useMemo(() => categories.length, [categories])
  
  const selectedProductsCount = useMemo(() => {
    // Créer un Set pour éviter de compter les doublons
    const uniqueProducts = new Set<string>()
    
    Array.from(selectedCategories).forEach(category => {
      const products = productsByCategory[category] || []
      products.forEach(product => {
        // Utiliser l'ID du produit ou le nom comme identifiant unique
        const productId = product.id || product.nom || `${product.categorie}-${product.nom}`
        uniqueProducts.add(productId)
      })
    })
    
    return uniqueProducts.size
  }, [selectedCategories, productsByCategory])

  const totalProductsCount = useMemo(() => {
    return Object.values(productsByCategory).reduce((total, products) => total + products.length, 0)
  }, [productsByCategory])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setLoadingProgress(0)
      setLoadingStep("Connexion à la base de données...")
      
      try {
        setLoadingProgress(20)
        await new Promise(resolve => setTimeout(resolve, 200))
        
        setLoadingStep("Récupération des produits...")
        setLoadingProgress(40)
        // Utiliser le service client
        const data = await productService.getProductsByCategory()
        
        setLoadingStep("Organisation par catégories...")
        setLoadingProgress(70)
        setProductsByCategory(data)
        const cats = Object.keys(data)
          .filter(category => category.toLowerCase() !== 'accueil') // Filtrer la catégorie "accueil"
          .sort()
        setCategories(cats)
        
        setLoadingStep("Préparation de l'affichage...")
        setLoadingProgress(90)
        // Par défaut, aucune catégorie n'est sélectionnée
        setSelectedCategories(new Set())
        
        setLoadingProgress(100)
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [productService])

  // Fonctions optimisées avec useCallback
  const selectAllCategories = useCallback(async () => {
    setIsUpdating(true)
    try {
      // Petit délai pour les grosses sélections
      await new Promise(resolve => setTimeout(resolve, 100))
      setSelectedCategories(new Set(categories))
    } finally {
      setIsUpdating(false)
    }
  }, [categories])

  const deselectAllCategories = useCallback(async () => {
    setIsUpdating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 50))
      setSelectedCategories(new Set())
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const handlePrint = useCallback(() => {
    // Ajouter un délai avant l'impression pour permettre le chargement des images
    setTimeout(() => {
      window.print()
    }, 500)
  }, [])

  const handleCategoryToggle = useCallback(async (category: string, checked: boolean) => {
    setIsUpdating(true)
    try {
      // Petit délai pour simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 30))
      setSelectedCategories(prev => {
        const newSet = new Set(prev)
        if (checked) {
          newSet.add(category)
        } else {
          newSet.delete(category)
        }
        return newSet
      })
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1">
        {/* Header Mobile Style */}
        <section className="bg-white border-b border-gray-200 px-4 py-4">
          {/* Breadcrumb compact */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              ← Catalogue
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Générateur</h1>
              <p className="text-sm text-gray-600 mt-1">
                Créez votre catalogue personnalisé
              </p>
            </div>
            
            {/* Stats mobile compactes */}
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{selectedCount}</div>
              <div className="text-xs text-gray-500">sélectionnées</div>
            </div>
          </div>
        </section>

        {/* Container mobile avec padding adapté */}
        <div className="p-4 space-y-4">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Catégories</div>
                  <div className="font-semibold text-gray-900">{selectedCount}/{totalCount}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Produits</div>
                  <div className="font-semibold text-gray-900">{selectedProductsCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Actions rapides</h3>
              <div className="text-xs text-gray-500">
                {isUpdating ? 'Mise à jour...' : selectedCount > 0 ? 'Prêt' : 'En attente'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllCategories} 
                disabled={isUpdating}
                className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="flex items-center justify-center min-w-[16px]">
                  {isUpdating ? (
                    <ButtonSpinner />
                  ) : (
                    <CheckSquare className="h-3 w-3" />
                  )}
                </div>
                <span className="ml-1">Tout</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={deselectAllCategories} 
                disabled={isUpdating}
                className="flex-1 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="flex items-center justify-center min-w-[16px]">
                  {isUpdating ? (
                    <ButtonSpinner />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </div>
                <span className="ml-1">Aucun</span>
              </Button>
            </div>
          </div>

          {/* Liste des catégories - Style Mobile avec optimisation */}
          <div className={`relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
            isUpdating ? 'opacity-75' : ''
          }`}>
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Sélection des catégories</h3>
                  <p className="text-xs text-gray-600 mt-1">Appuyez pour sélectionner/désélectionner</p>
                </div>
                {isUpdating && <InlineLoader />}
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {categories.map((category) => {
                const productCount = productsByCategory[category]?.length || 0
                const isSelected = selectedCategories.has(category)
                
                return (
                  <CategoryItem
                    key={category}
                    category={category}
                    productCount={productCount}
                    isSelected={isSelected}
                    onToggle={handleCategoryToggle}
                  />
                )
              })}
            </div>
          </div>

          {/* Section de chargement - optimisée sans espace supplémentaire */}
          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="w-full max-w-sm">
                {/* Spinner principal avec double rotation */}
                <div className="flex justify-center mb-6">
                  <div className="loading-spinner-complex">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-1 w-10 h-10 border-4 border-transparent border-r-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-3 w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Message de chargement */}
                <div className="text-center mb-6">
                  <p className="font-semibold text-gray-900 mb-2 animate-fade-in">{loadingStep}</p>
                  <div className="flex items-center justify-center gap-2 text-sm mb-3" style={{ animationDelay: '0.2s' }}>
                    <span className="font-medium text-primary">{Math.round(loadingProgress)}%</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {loadingProgress < 30 ? "Initialisation" : 
                       loadingProgress < 60 ? "Chargement des données" :
                       loadingProgress < 90 ? "Organisation" : "Finalisation"}
                    </span>
                  </div>
                </div>

                {/* Skeleton pour preview du tableau */}
                <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded loading-skeleton"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1 loading-skeleton"></div>
                  </div>
                  <div className="space-y-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="grid grid-cols-4 gap-3 loading-state" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                        <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                        <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                        <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicateur de progression réel */}
                <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar - Fixed Mobile Style */}
        {selectedCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
            <div className="flex flex-col gap-3">
              {/* Summary compact */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedCount} catégorie{selectedCount > 1 ? 's' : ''} • {selectedProductsCount} produits
                </span>
                <span className="text-primary font-medium">Prêt à générer</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handlePrint} 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg h-12 text-base font-medium"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Imprimer
                </Button>
                
                <PdfDownloadButton 
                  documentTitle="Catalogue Panneaux Léontine - Sélection personnalisée"
                  className="flex-1 h-12 text-base font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Spacer for bottom bar */}
        {selectedCount > 0 && <div className="h-32"></div>}

        {/* Loader global - seulement pour les grosses opérations */}
        {isUpdating && selectedCount > 10 && (
          <MobileAppLoader message="Synchronisation en cours..." />
        )}

        {/* Contenu pour impression uniquement */}
        {!isLoading && selectedCategories.size > 0 && (
          <>
            {/* En-tête pour la version imprimée */}
            <div className="hidden print:block print:mb-8">
              <div className="container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="/logo_kleur_2021.png" alt="Panneaux Léontine" className="h-16" />
                    <div>
                      <h1 className="text-2xl font-bold">Catalogue de Produits</h1>
                      <p className="text-sm text-muted-foreground">
                        Panneaux Léontine - {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>Rue des Tiges 2</p>
                    <p>5330 Assesse (Belgique)</p>
                    <p>+32(0)487 27 07 19</p>
                    <p>info@panneauxleontine.be</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table des matières pour la version imprimée */}
            <div className="mb-8 print:mb-12 hidden print:block">
              <div className="container">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Table des matières</h2>
                <ul className="columns-2 sm:columns-3 gap-8">
                  {categories
                    .filter((category) => selectedCategories.has(category))
                    .map((category) => (
                      <li key={category} className="mb-2">
                        <a
                          href={`#category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                          className="hover:text-primary"
                        >
                          {category} ({productsByCategory[category].length})
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Contenu du catalogue pour impression */}
            <div className="hidden print:block">
              <div className="container space-y-12">
                {categories
                  .filter((category) => selectedCategories.has(category))
                  .map((category) => (
                    <section
                      key={category}
                      id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                      className="print:break-inside-avoid-page"
                    >
                      <h2 className="text-2xl font-bold mb-6 bg-primary text-white p-3 print:mt-8">{category}</h2>
                      <CatalogueTable products={productsByCategory[category]} />
                    </section>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Pied de page pour la version imprimée */}
        <div className="hidden print:block print:fixed print:bottom-0 print:w-full print:border-t print:py-2">
          <div className="container">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Panneaux Léontine - Catalogue {new Date().toLocaleDateString("fr-FR")}</span>
              <span>www.panneauxleontine.be</span>
              <span className="print-page-number"></span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-gray-50 print:hidden">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Panneaux Léontine. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:underline">
              Mentions légales
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}