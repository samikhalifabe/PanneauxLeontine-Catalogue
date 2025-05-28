"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"

interface CatalogueTableProps {
  products: Product[]
}

export function CatalogueTable({ products }: CatalogueTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Réf.</th>
            <th className="border p-2 text-left">Produit</th>
            <th className="border p-2 text-left">Photo</th>
            <th className="border p-2 text-left">Dimensions</th>
            <th className="border p-2 text-left">Prix TVAC</th>
            <th className="border p-2 text-left">Informations</th>
            <th className="border p-2 text-left">Disponibilité</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            // Extraire les dimensions du nom ou de la description
            let dimensions = "Non spécifié"
            const dimensionsRegex =
              /(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*(?:cm|mm|m)?/

            const nameMatch = product.name?.match(dimensionsRegex)
            const descMatch = product.short_description?.match(dimensionsRegex)

            if (nameMatch) {
              dimensions = `${nameMatch[1]} x ${nameMatch[2]} x ${nameMatch[3]} cm`
            } else if (descMatch) {
              dimensions = `${descMatch[1]} x ${descMatch[2]} x ${descMatch[3]} cm`
            }

            // Utiliser l'image originale mais avoir un fallback en cas d'erreur
            const imageUrl = product.cover_image || "/wooden-panel-texture.png"
            const isExternalImage = imageUrl.startsWith("http")

            return (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="border p-2">{product.reference_code}</td>
                <td className="border p-2 font-medium">{product.name}</td>
                <td className="border p-2">
                  <div className="relative h-24 w-24">
                    {/* Image optimisée avec lazy loading pour l'affichage à l'écran */}
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover print:hidden"
                      sizes="96px"
                      loading="lazy"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
                      onError={(e) => {
                        // En cas d'erreur de chargement, remplacer par un placeholder
                        const target = e.target as HTMLImageElement
                        target.onerror = null // Éviter les boucles infinies
                        target.src = `/placeholder.svg?height=150&width=150&query=${encodeURIComponent(product.name || "produit")}`
                      }}
                    />

                    {/* Image standard pour l'impression uniquement */}
                    <img
                      src={imageUrl || "/placeholder.svg?height=150&width=150&query=produit"}
                      alt={product.name}
                      className="hidden print:block w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = `/placeholder.svg?height=150&width=150&query=${encodeURIComponent(product.name || "produit")}`
                      }}
                    />
                  </div>
                </td>
                <td className="border p-2">{dimensions}</td>
                <td className="border p-2 font-semibold text-primary">{formatPrice(product.price_with_tax)}</td>
                <td className="border p-2 text-sm">
                  {product.short_description ? (
                    <span className="line-clamp-2">{product.short_description.replace(/<[^>]*>/g, "")}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border p-2">
                  {product.availability ? (
                    <span className="text-green-600 font-medium">En stock</span>
                  ) : (
                    <span className="text-gray-500">Sur commande</span>
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
