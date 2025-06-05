"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import type { Product } from "@/types/product"
import { CatalogueTableWithSelector } from "@/components/catalogue-table-with-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientProductService } from "@/lib/services/client-product-service"
import type { ProductsByCategory, CategoryCounts } from "@/lib/services/client-product-service"
import { Button } from "@/components/ui/button"
import { Printer, Download, FileText, Filter, Loader2 } from "lucide-react"
import Image from "next/image"
import { ProgressCircle } from "@/components/ui/progress-circle"

export default function HomePage() {
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({})
  const [totalUniqueProducts, setTotalUniqueProducts] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState<string>("Préparation...")
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Instance du service client
  const productService = ClientProductService.getInstance()

  // Chargement initial des catégories et de leurs compteurs
  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true)
        setError(null)
        setLoadingProgress(0)
        
        setLoadingStep("Connexion au catalogue...")
        setLoadingProgress(10)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        setLoadingStep("Récupération des catégories...")
        setLoadingProgress(25)
        // Charger les catégories et leurs compteurs avec le service client
        const { categories, categoryCounts } = await productService.getCategoriesData()
        
        setLoadingStep("Analyse des produits...")
        setLoadingProgress(50)
        setAvailableCategories(categories)
        setCategoryCounts(categoryCounts)
        
        // Charger le nombre total unique de produits
        const totalCount = await productService.getUniqueProductsCount()
        setTotalUniqueProducts(totalCount)
        
        setLoadingStep("Chargement des produits...")
        setLoadingProgress(75)
        // Par défaut, sélectionner les 3 premières catégories pour réduire le chargement initial
        const initialCategories = categories.slice(0, 3)
        setSelectedCategories(initialCategories)
        
        // Charger seulement les produits des catégories sélectionnées
        const products = await productService.getProductsByCategory(initialCategories)
        setProductsByCategory(products)
        
        setLoadingStep("Finalisation...")
        setLoadingProgress(90)
        await new Promise(resolve => setTimeout(resolve, 200))
        
        setLoadingProgress(100)
        await new Promise(resolve => setTimeout(resolve, 300)) // Petit délai pour voir la completion
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données")
        console.error("Erreur dans HomePage:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [productService])

  // Fonction pour charger les produits des nouvelles catégories sélectionnées
  const handleCategorySelectionChange = async (newSelectedCategories: string[]) => {
    setSelectedCategories(newSelectedCategories)
    
    try {
      // Recharger tous les produits des catégories sélectionnées
      const products = await productService.getProductsByCategory(newSelectedCategories)
      setProductsByCategory(products)
    } catch (err) {
      console.error("Erreur lors du chargement des nouvelles catégories:", err)
      setError("Erreur lors du chargement des catégories sélectionnées")
    }
  }

  const hasData = availableCategories.length > 0

  if (isLoading) {
    return (
      <div className="mobile-loader">
        <div className="w-full max-w-md">
          {/* Logo animé */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full animate-pulse"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-2xl border border-primary/10 animate-float">
                <Image 
                  src="/logo_kleur_2021.png" 
                  alt="Panneaux Léontine" 
                  width={180} 
                  height={60} 
                  priority 
                  style={{ height: "auto" }}
                  className="h-12 w-auto mx-auto animate-pulse-soft"
                />
              </div>
            </div>
            
            {/* Titre animé */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 animate-fade-in">
                Catalogue Produits
              </h1>
              <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Découvrez nos panneaux et produits
              </p>
            </div>
          </div>

          {/* Spinner principal avec double rotation */}
          <div className="flex justify-center mb-6">
            <div className="loading-spinner-complex">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-r-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Message de statut dynamique */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="font-semibold text-gray-900 animate-fade-in">
                {loadingStep}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Veuillez patienter pendant que nous préparons votre catalogue
            </p>
            
            {/* Pourcentage de progression */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-medium text-primary">{Math.round(loadingProgress)}%</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {loadingProgress < 25 ? "Initialisation" : 
                 loadingProgress < 50 ? "Récupération des données" :
                 loadingProgress < 75 ? "Traitement" :
                 loadingProgress < 90 ? "Chargement du contenu" : "Presque terminé"}
              </span>
            </div>
          </div>

          {/* Skeleton cards pour prévisualiser le contenu */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg loading-skeleton"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded loading-skeleton mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded loading-skeleton w-2/3"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg loading-skeleton" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded loading-skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1 loading-skeleton"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                  <div className="h-8 bg-gray-100 rounded loading-skeleton"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicateur de progression réel */}
          <div className="mt-8 space-y-2">
            {/* Barre de progression principale */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${loadingProgress}%` }}
              >
                {/* Effet de brillance qui se déplace */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Progression circulaire alternative - plus compact */}
            <div className="flex items-center justify-center">
              <ProgressCircle 
                progress={loadingProgress} 
                size="md" 
                className="drop-shadow-sm" 
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SiteHeader />
      <main className="flex-1">
        {/* En-tête condensé et efficace */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-6 border-b border-primary/10">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Catalogue Produits
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Explorez notre gamme complète de panneaux en bois et produits d'aménagement
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {availableCategories.length} catégories
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {totalUniqueProducts} produits
                  </span>
                </div>
              </div>
              
              {/* Actions d'impression pour mobile */}
              <div className="flex md:hidden">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-primary/90 hover:bg-primary text-white rounded-xl shadow-sm"
                >
                  <Link href="/catalogue-tableau">
                    <FileText className="mr-2 h-3 w-3" />
                    <span className="text-xs">Générer votre catalogue personnalisé</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-6">
          {error ? (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          ) : !hasData ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</p>
              <p className="text-muted-foreground">Le catalogue sera bientôt disponible</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <CatalogueTableWithSelector 
                productsByCategory={productsByCategory} 
                categories={availableCategories}
                categoryCounts={categoryCounts}
                selectedCategories={selectedCategories}
                onCategorySelectionChange={handleCategorySelectionChange}
              />
            </div>
          )}
        </div>

        {/* Pied de page pour la version imprimée */}
        <div className="hidden print:block print:fixed print:bottom-0 print:w-full print:border-t print:py-2 print:bg-white">
          <div className="container">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Panneaux Léontine - Catalogue {new Date().toLocaleDateString("fr-FR")}</span>
              <span>www.panneauxleontine.be</span>
              <span className="print-page-number"></span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer moderne et condensé */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 print:hidden">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Image 
                src="/logo_kleur_2021.png" 
                alt="Panneaux Léontine" 
                width={140} 
                height={47} 
                className="h-8 w-auto mb-3 brightness-0 invert opacity-80"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
                Spécialiste en panneaux bois et aménagements extérieurs depuis plus de 30 ans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-white">Nos Services</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Panneaux sur mesure</li>
                <li>• Terrasses et bardages</li>
                <li>• Conseil personnalisé</li>
                <li>• Livraison rapide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-white">Contact</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>📍 Belgique</p>
                <p>🌐 www.panneauxleontine.be</p>
                <div className="mt-3">
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link
                      href="http://shop.panneauxleontine.be/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visiter notre E-Shop
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Panneaux Léontine. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
