"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { CatalogueTable } from "@/components/catalogue-table"
import { Button } from "@/components/ui/button"
import { Printer, CheckSquare, Square, Info } from "lucide-react"
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

export default function CatalogueTableauPage() {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({})
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Instance du service client
  const productService = ClientProductService.getInstance()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Utiliser le service client
        const data = await productService.getProductsByCategory()
        setProductsByCategory(data)
        const cats = Object.keys(data).sort()
        setCategories(cats)
        // Par défaut, toutes les catégories sont sélectionnées
        setSelectedCategories(new Set(cats))
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [productService])

  const selectAllCategories = () => {
    setSelectedCategories(new Set(categories))
  }

  const deselectAllCategories = () => {
    setSelectedCategories(new Set())
  }

  const handlePrint = () => {
    // Ajouter un délai avant l'impression pour permettre le chargement des images
    setTimeout(() => {
      window.print()
    }, 500)
  }

  // Calculer le nombre de catégories sélectionnées
  const selectedCount = selectedCategories.size
  const totalCount = categories.length

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Le Catalogue</h1>
                <p className="mt-2 text-muted-foreground">
                  Consultez notre catalogue de produits dans un format tabulaire facile à imprimer
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 print:hidden">
                <Button onClick={handlePrint} size="lg" className="bg-primary hover:bg-primary/90">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer les catégories sélectionnées
                </Button>
                <PdfDownloadButton documentTitle="Catalogue Panneaux Léontine" />
              </div>
            </div>
          </div>
        </section>

        {/* Message d'information */}
        <div className="container mt-4 print:hidden">
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Personnalisez votre catalogue en sélectionnant uniquement les catégories qui vous intéressent ci-dessous,
              puis cliquez sur "Imprimer les catégories sélectionnées".
            </AlertDescription>
          </Alert>
        </div>

        {/* Sélecteur de catégories */}
        <div className="container py-2 print:hidden">
          <Card className="border-primary/20">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Personnalisez votre impression</span>
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedCount} sur {totalCount} catégories sélectionnées
                </div>
              </CardTitle>
              <CardDescription>
                Cochez les catégories que vous souhaitez inclure dans votre impression ou votre PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="outline" size="sm" onClick={selectAllCategories}>
                  <CheckSquare className="h-4 w-4 mr-1" /> Tout sélectionner
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllCategories}>
                  <Square className="h-4 w-4 mr-1" /> Tout désélectionner
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.has(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories(prev => new Set([...prev, category]))
                        } else {
                          setSelectedCategories(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(category)
                            return newSet
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                      {category} ({productsByCategory[category]?.length || 0})
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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

        <div className="container py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement du catalogue...</p>
            </div>
          ) : (
            <>
              {/* Table des matières pour la version imprimée */}
              <div className="mb-8 print:mb-12 hidden print:block">
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

              {/* Contenu du catalogue */}
              <div className="space-y-12">
                {selectedCategories.size === 0 ? (
                  <div className="text-center py-12 border rounded-md">
                    <p className="text-muted-foreground">Veuillez sélectionner au moins une catégorie à afficher</p>
                  </div>
                ) : (
                  categories
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
                    ))
                )}
              </div>
            </>
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
