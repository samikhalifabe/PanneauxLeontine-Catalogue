"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ShoppingCart, ExternalLink, Eye } from "lucide-react"
import { SafeImage } from "@/components/safe-image"
import { ProductDetailsModal } from "@/components/product-details-modal"

interface CatalogueTableProps {
  products: Product[]
}

export function CatalogueTable({ products }: CatalogueTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <>
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
                ACTIONS
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
                    <button
                      onClick={() => openModal(product)}
                      className="font-semibold text-slate-900 leading-tight hover:text-primary hover:underline cursor-pointer text-left transition-colors"
                    >
                      {product.name}
                    </button>
                  </td>
                  <td className="border-r border-slate-100 p-4">
                    <button
                      onClick={() => openModal(product)}
                      className="relative h-28 w-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-primary transition-colors cursor-pointer group"
                    >
                      <SafeImage
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="112px"
                        quality={85}
                        productName={product.name}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </button>
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
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openModal(product)}
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary hover:text-white transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir plus
                      </Button>
                      
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
                        <div className="flex flex-col items-center gap-1 text-slate-400 py-2">
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-xs">Non disponible</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de détails du produit */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}
