"use client"

import { useState, useEffect, useMemo } from "react"
import { CatalogueTable } from "@/components/catalogue-table"
import { Button } from "@/components/ui/button"
import { Printer, CheckSquare, Square, Filter, Sparkles, Info, Eye, EyeOff, RotateCcw, Download } from "lucide-react"
import type { Product } from "@/types/product"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageStatusIndicator } from "@/components/image-status-indicator"
import { PdfDownloadButton } from "@/components/pdf-download-button"

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
  const totalProducts = Array.from(selectedCategories).reduce((sum, cat) => 
    sum + (categoryCounts[cat] || productsByCategory[cat]?.length || 0), 0
  )

  return (
    <>
      {/* Sélecteur de catégories moderne et condensé */}
      <div className="mb-8 print:hidden">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-slate-50/50 to-white overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20">
                  <Filter className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-display font-bold text-gray-900">
                    Personnalisez votre catalogue
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 max-w-2xl leading-relaxed">
                    Sélectionnez les catégories de produits que vous souhaitez consulter ou imprimer.
                  </CardDescription>
                  
                  {/* Informations en temps réel */}
                  <div className="flex items-center gap-4 pt-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        {selectedCount} catégorie{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    {totalProducts > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700">
                          {totalProducts} produit{totalProducts > 1 ? 's' : ''} à afficher
                        </span>
                      </div>
                    )}
                    {/* Indicateur temporairement désactivé pour éviter les problèmes de performance */}
                    {/* {selectedImages.length > 0 && (
                      <ImageStatusIndicator 
                        imageUrls={selectedImages} 
                        className="text-xs"
                      />
                    )} */}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Printer className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Imprimer la sélection</span>
                </Button>
                <PdfDownloadButton documentTitle="Catalogue Panneaux Léontine" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Actions rapides avec explications */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllCategories} 
                    className="h-9 px-4 font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" /> 
                    Tout sélectionner
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={deselectAllCategories} 
                    className="h-9 px-4 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                  >
                    <EyeOff className="h-4 w-4 mr-2" /> 
                    Tout désélectionner
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span>Cliquez sur les cartes pour sélectionner/désélectionner</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 font-medium bg-white">
                  {selectedCount}/{totalCount} catégories
                </Badge>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="px-3 py-1 font-medium">
                    {totalProducts} produits
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Grille de sélection des catégories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => {
                const count = categoryCounts[category] || productsByCategory[category]?.length || 0
                const isSelected = selectedCategories.has(category)
                
                return (
                  <div 
                    key={category} 
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                    onClick={() => handleCategoryToggle(category, !isSelected)}
                  >
                    {/* Indicateur de sélection */}
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary shadow-sm' 
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}>
                      {isSelected && (
                        <CheckSquare className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`category-${category}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={`category-${category}`} 
                            className="cursor-pointer text-base font-semibold leading-tight block text-gray-900 group-hover:text-gray-800"
                          >
                            {category}
                          </Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={isSelected ? "default" : "secondary"} 
                          className={`text-xs font-medium ${
                            isSelected 
                              ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count} produit{count > 1 ? 's' : ''}
                        </Badge>
                        
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Sélectionné</span>
                          </div>
                        )}
                      </div>
                    </div>
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
      <div className="space-y-10">
        {selectedCategories.size === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Filter className="h-10 w-10 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-display font-semibold text-gray-900">Aucune catégorie sélectionnée</p>
                <p className="text-gray-600 max-w-md">
                  Pour commencer, sélectionnez au moins une catégorie dans le panneau ci-dessus. 
                  Vous pourrez ensuite consulter et imprimer vos produits préférés.
                </p>
              </div>
              <Button 
                onClick={selectAllCategories}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                <Eye className="mr-2 h-4 w-4" />
                Sélectionner toutes les catégories
              </Button>
            </div>
          </div>
        ) : (
          categories
            .filter((category) => selectedCategories.has(category))
            .map((category, index) => (
              <section
                key={category}
                id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                className="print:break-inside-avoid-page animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-6 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-8 bg-gradient-to-b from-primary to-primary/70 rounded-full print:hidden"></div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gray-900 print:text-black print:bg-primary print:text-white print:p-3 print:mt-8">
                        {category}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1 print:hidden">
                        Explorez notre sélection de produits dans cette catégorie
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 print:hidden">
                    <Badge variant="outline" className="px-4 py-2 bg-white border-primary/30 text-primary font-semibold">
                      {productsByCategory[category]?.length || 0} produit{(productsByCategory[category]?.length || 0) > 1 ? 's' : ''}
                    </Badge>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden print:border-0 print:shadow-none print:rounded-none hover:shadow-xl transition-shadow duration-300">
                  <CatalogueTable products={productsByCategory[category] || []} />
                </div>
              </section>
            ))
        )}
      </div>
    </>
  )
}
