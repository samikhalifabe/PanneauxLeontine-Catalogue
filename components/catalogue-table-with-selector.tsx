"use client"

import { useState, useEffect } from "react"
import { CatalogueTable } from "@/components/catalogue-table"
import { Button } from "@/components/ui/button"
import { Printer, CheckSquare, Square } from "lucide-react"
import type { Product } from "@/types/product"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
    new Set(externalSelectedCategories || categories)
  )

  // Synchroniser avec les catégories externes si fournies
  useEffect(() => {
    if (externalSelectedCategories) {
      setSelectedCategories(new Set(externalSelectedCategories))
    }
  }, [externalSelectedCategories])

  const selectAllCategories = () => {
    const newSelection = new Set(categories)
    setSelectedCategories(newSelection)
    onCategorySelectionChange?.(Array.from(newSelection))
  }

  const deselectAllCategories = () => {
    const newSelection = new Set<string>()
    setSelectedCategories(newSelection)
    onCategorySelectionChange?.(Array.from(newSelection))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const newSelection = new Set(selectedCategories)
    if (checked) {
      newSelection.add(category)
    } else {
      newSelection.delete(category)
    }
    setSelectedCategories(newSelection)
    onCategorySelectionChange?.(Array.from(newSelection))
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
    <>
      {/* Sélecteur de catégories */}
      <div className="py-2 print:hidden">
        <Card className="border-primary/20">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Personnalisez votre impression</span>
              <div className="text-sm font-normal text-muted-foreground">
                {selectedCount} sur {totalCount} catégories sélectionnées
              </div>
            </CardTitle>
            <CardDescription>Sélectionnez les catégories à afficher et imprimer</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between mb-4 gap-2">
              <div>
                <Button variant="outline" size="sm" onClick={selectAllCategories} className="mr-2">
                  <CheckSquare className="h-4 w-4 mr-1" /> Tout sélectionner
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllCategories}>
                  <Square className="h-4 w-4 mr-1" /> Tout désélectionner
                </Button>
              </div>
              <div>
                <Button onClick={handlePrint} size="sm" className="bg-primary hover:bg-primary/90">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer les catégories sélectionnées
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => {
                // Utiliser le compteur de catégorie ou le nombre de produits chargés
                const count = categoryCounts[category] || productsByCategory[category]?.length || 0
                
                return (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.has(category)}
                      onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                      {category} ({count})
                    </Label>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des matières pour la version imprimée */}
      <div className="mb-8 print:mb-12 hidden print:block">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Table des matières</h2>
        <ul className="columns-2 sm:columns-3 gap-8">
          {categories
            .filter((category) => selectedCategories.has(category))
            .map((category) => {
              // Utiliser le compteur de catégorie ou le nombre de produits chargés
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
                <CatalogueTable products={productsByCategory[category] || []} />
              </section>
            ))
        )}
      </div>
    </>
  )
}
