"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import type { Product } from "@/types/product"
import { CatalogueTableWithSelector } from "@/components/catalogue-table-with-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSharedSupabaseClient } from "@/lib/supabase-client"

// Fonction optimisée pour récupérer tous les produits groupés par catégorie
async function getProductsByCategory(selectedCategories?: string[]): Promise<Record<string, Product[]>> {
  try {
    const supabase = await getSharedSupabaseClient()

    // Si des catégories spécifiques sont sélectionnées, on ne récupère que celles-ci
    let query = supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      
    // Filtrer par catégories si spécifiées
    if (selectedCategories && selectedCategories.length > 0) {
      query = query.in("category", selectedCategories)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return {}
    }

    // Grouper les produits par catégorie
    const productsByCategory: Record<string, Product[]> = {}
    data.forEach((product: any) => {
      const category = product.category || "Non classé"
      if (!productsByCategory[category]) {
        productsByCategory[category] = []
      }
      productsByCategory[category].push(product)
    })

    return productsByCategory
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return {}
  }
}

// Fonction pour récupérer uniquement les catégories disponibles avec leur nombre de produits
async function getAvailableCategoriesWithCount(): Promise<Record<string, number>> {
  try {
    const supabase = await getSharedSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return {}
    }

    // Compter les produits par catégorie
    const categoryCounts: Record<string, number> = {}
    data.forEach((item: { category: string }) => {
      const category = item.category || "Non classé"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    return categoryCounts
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return {}
  }
}

// Fonction pour récupérer uniquement les catégories disponibles
async function getAvailableCategories(): Promise<string[]> {
  try {
    const supabase = await getSharedSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // Extraire les catégories uniques avec typage correct
    const categories = [...new Set(data.map((item: { category: string }) => item.category))].sort()
    return categories as string[]
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return []
  }
}

export default function HomePage() {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chargement initial des catégories et de leurs compteurs
  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Charger les catégories et leurs compteurs en parallèle
        const [categories, counts] = await Promise.all([
          getAvailableCategories(),
          getAvailableCategoriesWithCount()
        ])
        
        setAvailableCategories(categories)
        setCategoryCounts(counts)
        
        // Par défaut, sélectionner les 3 premières catégories pour réduire le chargement initial
        const initialCategories = categories.slice(0, 3)
        setSelectedCategories(initialCategories)
        
        // Charger seulement les produits des catégories sélectionnées
        const products = await getProductsByCategory(initialCategories)
        setProductsByCategory(products)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données")
        console.error("Erreur dans HomePage:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Fonction pour charger les produits des nouvelles catégories sélectionnées
  const handleCategorySelectionChange = async (newSelectedCategories: string[]) => {
    setSelectedCategories(newSelectedCategories)
    
    // Identifier les nouvelles catégories à charger
    const categoriesToLoad = newSelectedCategories.filter(
      cat => !Object.keys(productsByCategory).includes(cat)
    )
    
    if (categoriesToLoad.length > 0) {
      try {
        const newProducts = await getProductsByCategory(categoriesToLoad)
        setProductsByCategory(prev => ({ ...prev, ...newProducts }))
      } catch (err) {
        console.error("Erreur lors du chargement des nouvelles catégories:", err)
      }
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
              <p>Chargement du catalogue...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-4">
          <div className="container">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Le Catalogue</h1>
              <p className="mt-2 text-muted-foreground">
                Consultez notre catalogue de produits dans un format tabulaire facile à imprimer
              </p>
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

        <div className="container py-3">
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !hasData ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">Aucune donnée de catalogue disponible pour le moment.</p>
            </div>
          ) : (
            <CatalogueTableWithSelector 
              productsByCategory={productsByCategory} 
              categories={availableCategories}
              categoryCounts={categoryCounts}
              selectedCategories={selectedCategories}
              onCategorySelectionChange={handleCategorySelectionChange}
            />
          )}
        </div>

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
