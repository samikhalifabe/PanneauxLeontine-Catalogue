"use client"

import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ShoppingCart, ExternalLink } from "lucide-react"
import { SafeImage } from "@/components/safe-image"

interface CatalogueTableProps {
  products: Product[]
}

export function CatalogueTable({ products }: CatalogueTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              RÉFÉRENCE
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              PRODUIT
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              PHOTO
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              DIMENSIONS
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              PRIX TVAC
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              DESCRIPTION
            </th>
            <th className="border-r border-slate-200 p-4 text-left font-semibold text-slate-700 text-sm tracking-wide">
              DISPONIBILITÉ
            </th>
            <th className="p-4 text-center font-semibold text-slate-700 text-sm tracking-wide print:hidden">
              COMMANDER
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            // Extraire les dimensions du nom ou de la description
            let dimensions = "Non spécifié"
            const dimensionsRegex =
              /(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*(?:cm|mm|m)?/

            const nameMatch = product.name?.match(dimensionsRegex)
            const descMatch = product.short_description?.match(dimensionsRegex)

            if (nameMatch) {
              dimensions = `${nameMatch[1]} × ${nameMatch[2]} × ${nameMatch[3]} cm`
            } else if (descMatch) {
              dimensions = `${descMatch[1]} × ${descMatch[2]} × ${descMatch[3]} cm`
            }

            // Utiliser l'image originale avec le composant SafeImage
            const imageUrl = product.cover_image || ""

            return (
              <tr 
                key={product.id} 
                className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                }`}
              >
                <td className="border-r border-slate-100 p-4">
                  <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                    {product.reference_code}
                  </code>
                </td>
                <td className="border-r border-slate-100 p-4">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {product.name}
                  </div>
                </td>
                <td className="border-r border-slate-100 p-4">
                  <div className="relative h-28 w-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <SafeImage
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                      sizes="112px"
                      quality={85}
                      productName={product.name}
                    />
                  </div>
                </td>
                <td className="border-r border-slate-100 p-4">
                  <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {dimensions}
                  </Badge>
                </td>
                <td className="border-r border-slate-100 p-4">
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(product.price_with_tax)}
                  </div>
                </td>
                <td className="border-r border-slate-100 p-4">
                  <div className="text-sm text-slate-600 leading-relaxed max-w-xs">
                    {product.short_description ? (
                      <span className="line-clamp-3">
                        {product.short_description.replace(/<[^>]*>/g, "")}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Aucune description disponible</span>
                    )}
                  </div>
                </td>
                <td className="border-r border-slate-100 p-4">
                  {product.availability ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      En stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Sur commande
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-center print:hidden">
                  {product.product_link ? (
                    <Button
                      asChild
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <a
                        href={product.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-medium">Commander</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-xs">Non disponible</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
