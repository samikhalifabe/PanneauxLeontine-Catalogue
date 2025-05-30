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
import { Printer, Download, FileText, Filter } from "lucide-react"

export default function HomePage() {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({})
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Instance du service client
  const productService = ClientProductService.getInstance()

  // Chargement initial des catégories et de leurs compteurs
  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Charger les catégories et leurs compteurs avec le service client
        const { categories, categoryCounts } = await productService.getCategoriesData()
        
        setAvailableCategories(categories)
        setCategoryCounts(categoryCounts)
        
        // Par défaut, sélectionner les 3 premières catégories pour réduire le chargement initial
        const initialCategories = categories.slice(0, 3)
        setSelectedCategories(initialCategories)
        
        // Charger seulement les produits des catégories sélectionnées
        const products = await productService.getProductsByCategory(initialCategories)
        setProductsByCategory(products)
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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-12">
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Chargement du catalogue...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SiteHeader />
      <main className="flex-1">
        {/* En-tête condensé et efficace */}
        <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-gray-200/50">
          <div className="container py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                {/* Titre principal compact */}
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-gray-900">
                    Catalogue Produits
                  </h1>
                </div>
                
                {/* Statistiques compactes */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Filter className="h-4 w-4 text-primary" />
                    {availableCategories.length} catégories
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4 text-green-600" />
                    {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)} produits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* Contenu principal - catalogue immédiatement visible */}
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
      <footer className="border-t bg-gradient-to-r from-slate-50 via-white to-slate-50 py-8 print:hidden">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <p className="text-gray-600 font-medium">
                &copy; {new Date().getFullYear()} Panneaux Léontine. Tous droits réservés.
              </p>
              <div className="hidden md:block h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Catalogue en ligne</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                <Link 
                  href="/mentions-legales" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                >
                  Mentions légales
                </Link>
                <Link 
                  href="/contact" 
                  className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                >
                  Contact
                </Link>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-mono">Version 2024.1</div>
                <div className="text-xs text-gray-400 mt-1">Mise à jour continue</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
