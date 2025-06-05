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
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#c1343b' }}>
        {/* Patterns de fond animés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>

        <div className="relative flex flex-col items-center">
          {/* Logo avec spinner séparé en dessous */}
          <div className="relative mb-12 flex flex-col items-center">
            {/* Logo au-dessus - plus grand et plus haut */}
            <div className="mb-12">
              <Image 
                src="/logo-white-pl.png" 
                alt="Panneaux Léontine" 
                width={200} 
                height={67} 
                priority 
                style={{ height: "auto" }}
                className="h-16 w-auto"
                onError={(e) => {
                  // Fallback au logo normal si le blanc n'existe pas
                  e.currentTarget.src = "/logo_kleur_2021.png"
                }}
              />
            </div>

            {/* Spinner circulaire en dessous avec pourcentage au centre */}
            <div className="w-32 h-32 relative flex items-center justify-center">
              {/* Cercle externe */}
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              {/* Cercle animé */}
              <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              
              {/* Pourcentage au centre du cercle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Message et points animés */}
          <div className="text-center">
            {/* Points de chargement style iOS */}
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.2s'
                  }}
                />
              ))}
            </div>

            {/* Description de l'étape */}
            <div className="text-white/70 text-sm">
              {loadingProgress < 25 ? "Initialisation" : 
               loadingProgress < 50 ? "Récupération des données" :
               loadingProgress < 75 ? "Traitement" :
               loadingProgress < 90 ? "Chargement du contenu" : "Presque terminé"}
            </div>
          </div>

          {/* Barre de progression en bas */}
          <div className="fixed bottom-12 left-8 right-8">
            <div className="bg-white/20 rounded-full h-1 overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-white via-white/90 to-white/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
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
