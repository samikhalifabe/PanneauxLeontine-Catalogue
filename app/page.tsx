"use client"

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { CatalogueTableWithSelector } from "@/components/catalogue-table-with-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCatalogue } from "@/hooks/use-catalogue"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function HomePage() {
  const {
    productsByCategory,
    availableCategories,
    categoryCounts,
    selectedCategories,
    isLoading,
    error,
    setSelectedCategories,
    refreshData,
    clearError
  } = useCatalogue({
    initialCategoriesCount: 3,
    autoLoad: true
  })

  const hasData = availableCategories.length > 0

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-12">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Chargement du catalogue...</p>
              </div>
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Le Catalogue</h1>
                <p className="mt-2 text-muted-foreground">
                  Consultez notre catalogue de produits dans un format tabulaire facile à imprimer
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="print:hidden"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
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
              <AlertDescription className="flex justify-between items-center">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Fermer
                </Button>
              </AlertDescription>
            </Alert>
          ) : !hasData ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground mb-4">
                Aucune donnée de catalogue disponible pour le moment.
              </p>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : (
            <CatalogueTableWithSelector 
              productsByCategory={productsByCategory} 
              categories={availableCategories}
              categoryCounts={categoryCounts}
              selectedCategories={selectedCategories}
              onCategorySelectionChange={setSelectedCategories}
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