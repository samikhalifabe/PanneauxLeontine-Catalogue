"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ShoppingCart, ExternalLink, Eye } from "lucide-react"
import { SafeImage } from "@/components/safe-image"
import { ProductDetailsModal } from "@/components/product-details-modal"
import { ProductCompactCard } from "@/components/product-compact-card"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"

interface CatalogueTableProps {
  products: Product[]
}

// Composant de carte produit mobile optimisé avec memo
const MobileProductCard = memo(({ 
  product, 
  onOpenModal 
}: { 
  product: Product
  onOpenModal: (product: Product) => void 
}) => {
  return (
    <Card className="overflow-hidden border-gray-200 will-change-transform">
      <button 
        onClick={() => onOpenModal(product)}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <div className="relative aspect-square overflow-hidden">
          <SafeImage
            src={product.cover_image || "/placeholder.svg?height=200&width=200&query=panneau+en+bois"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
            quality={60}
            productName={product.name}
          />
          {product.availability ? (
            <Badge variant="default" className="absolute top-2 right-2 z-10 text-xs">
              En stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10 text-xs">
              Sur commande
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="mb-2">
            <h3 className="font-semibold text-sm line-clamp-2 text-gray-800 leading-tight">
              {product.name}
            </h3>
          </div>
          {product.short_description && (
            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {product.short_description.replace(/<[^>]*>/g, "")}
            </div>
          )}
          <div className="text-xs text-muted-foreground">Réf: {product.reference_code}</div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-3 bg-gray-50">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
            <span className="text-xs text-muted-foreground">TTC</span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {product.quantity > 0 ? `${product.quantity} dispo.` : "Sur commande"}
          </div>
        </CardFooter>
      </button>
    </Card>
  )
})
MobileProductCard.displayName = "MobileProductCard"

// Composant de ligne de tableau desktop optimisé avec memo
const DesktopTableRow = memo(({ 
  product, 
  index, 
  dimensions,
  onOpenModal 
}: { 
  product: Product
  index: number
  dimensions: string
  onOpenModal: (product: Product) => void 
}) => {
  const imageUrl = product.cover_image || ""

  return (
    <tr 
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
          onClick={() => onOpenModal(product)}
          className="font-semibold text-slate-900 leading-tight hover:text-primary hover:underline cursor-pointer text-left transition-colors"
        >
          {product.name}
        </button>
      </td>
      <td className="border-r border-slate-100 p-4">
        <button
          onClick={() => onOpenModal(product)}
          className="relative h-28 w-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-primary transition-colors cursor-pointer group"
        >
          <SafeImage
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="112px"
            quality={75}
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
            onClick={() => onOpenModal(product)}
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
})
DesktopTableRow.displayName = "DesktopTableRow"

// Fonction pour extraire les dimensions (mise en cache)
const extractDimensions = (product: Product): string => {
  const dimensionsRegex = /(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*(?:cm|mm|m)?/
  
  const nameMatch = product.name?.match(dimensionsRegex)
  const descMatch = product.short_description?.match(dimensionsRegex)

  if (nameMatch) {
    return `${nameMatch[1]} × ${nameMatch[2]} × ${nameMatch[3]} cm`
  } else if (descMatch) {
    return `${descMatch[1]} × ${descMatch[2]} × ${descMatch[3]} cm`
  }
  
  return "Non spécifié"
}

export function CatalogueTable({ products }: CatalogueTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Callbacks memoized
  const openModal = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }, [])

  // Pré-calculer les dimensions pour tous les produits avec memoization
  const productsWithDimensions = useMemo(() => {
    return products.map(product => ({
      ...product,
      _dimensions: extractDimensions(product)
    }))
  }, [products])

  // Pagination/chunking pour mobile pour améliorer les performances
  const MOBILE_INITIAL_SIZE = 20
  const MOBILE_LOAD_MORE_SIZE = 50
  const [loadedCount, setLoadedCount] = useState(MOBILE_INITIAL_SIZE)

  const visibleProducts = useMemo(() => {
    if (!isMobile) return productsWithDimensions
    
    return productsWithDimensions.slice(0, loadedCount)
  }, [productsWithDimensions, isMobile, loadedCount])

  const remainingCount = isMobile ? Math.max(0, productsWithDimensions.length - loadedCount) : 0
  const nextLoadCount = Math.min(MOBILE_LOAD_MORE_SIZE, remainingCount)
  const hasMoreProducts = remainingCount > 0

  // Fonction pour charger plus de produits
  const loadMoreProducts = useCallback(() => {
    setLoadedCount(prev => prev + MOBILE_LOAD_MORE_SIZE)
  }, [])

  // Reset du compteur quand les produits changent
  useEffect(() => {
    setLoadedCount(MOBILE_INITIAL_SIZE)
  }, [products])

  // Vue mobile : cartes optimisées avec pagination
  if (isMobile) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3 p-3">
          {visibleProducts.map((product) => (
            <MobileProductCard
              key={product.id}
              product={product}
              onOpenModal={openModal}
            />
          ))}
        </div>

        {/* Bouton "Voir plus" pour le mobile */}
        {hasMoreProducts && (
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg mx-3">
            {/* Indicateur de progression */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{loadedCount} affichés</span>
                <span>{productsWithDimensions.length} total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(loadedCount / productsWithDimensions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Boutons de chargement */}
            <div className="flex justify-center">
              <Button
                onClick={loadMoreProducts}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Voir {nextLoadCount} de plus
              </Button>
            </div>
          </div>
        )}

        {/* Modal de détails du produit */}
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
    )
  }

  // Vue desktop : tableau actuel
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
            {productsWithDimensions.map((product, index) => (
              <DesktopTableRow
                key={product.id}
                product={product}
                index={index}
                dimensions={product._dimensions}
                onOpenModal={openModal}
              />
            ))}
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
