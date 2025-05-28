"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Printer, ChevronDown, ChevronUp } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"

interface CatalogueCompletProps {
  productsByCategory: Record<string, Product[]>
}

export function CatalogueComplet({ productsByCategory }: CatalogueCompletProps) {
  const categories = Object.keys(productsByCategory).sort()
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => ({ ...acc, [category]: true }), {}),
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handlePrint = () => {
    // Expand all categories before printing
    const allExpanded = categories.reduce((acc, category) => ({ ...acc, [category]: true }), {})
    setExpandedCategories(allExpanded)

    // Wait for state update before printing
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div>
      <div className="flex justify-end mb-6 print:hidden">
        <Button onClick={handlePrint} size="lg">
          <Printer className="mr-2 h-4 w-4" />
          Imprimer le catalogue complet
        </Button>
      </div>

      {/* En-tête pour la version imprimée */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo_kleur_2021.png" alt="Panneaux Léontine" width={150} height={50} className="print:block" />
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

      {/* Table des matières pour la version imprimée */}
      <div className="mb-8 print:mb-12 hidden print:block">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Table des matières</h2>
        <ul className="columns-2 sm:columns-3 gap-8">
          {categories.map((category) => (
            <li key={category} className="mb-2">
              <a href={`#category-${category.replace(/\s+/g, "-").toLowerCase()}`} className="hover:text-primary">
                {category} ({productsByCategory[category].length})
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenu du catalogue */}
      <div className="space-y-8">
        {categories.map((category) => (
          <section
            key={category}
            id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
            className="print:break-inside-avoid-page"
          >
            <div
              className="flex items-center justify-between border-b border-primary pb-2 mb-4 cursor-pointer print:cursor-default"
              onClick={() => toggleCategory(category)}
            >
              <h2 className="text-2xl font-bold print:mt-8">
                {category}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({productsByCategory[category].length} produits)
                </span>
              </h2>
              <Button variant="ghost" size="sm" className="print:hidden">
                {expandedCategories[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>

            {expandedCategories[category] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-4">
                {productsByCategory[category].map((product) => (
                  <div key={product.id} className="flex border rounded-md overflow-hidden print:break-inside-avoid">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.cover_image || "/placeholder.svg?height=150&width=150&query=panneau+en+bois"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="p-3 flex-grow">
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {product.short_description || "Aucune description disponible"}
                      </p>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(product.price_with_tax)}
                        </span>
                        <span className="text-xs text-muted-foreground">Réf: {product.reference_code}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Pied de page pour la version imprimée */}
      <div className="hidden print:block print:fixed print:bottom-0 print:w-full print:border-t print:py-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Panneaux Léontine - Catalogue {new Date().toLocaleDateString("fr-FR")}</span>
          <span>www.panneauxleontine.be</span>
          <span className="print-page-number"></span>
        </div>
      </div>
    </div>
  )
}
