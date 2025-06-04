"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import { SafeImage } from "@/components/safe-image"
import { CheckCircle, Clock, ShoppingCart, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react"

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'short' | 'full'>('short')

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [product])

  if (!product) return null

  // Collecter toutes les images disponibles
  const images = [
    product.cover_image,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5
  ].filter((img): img is string => Boolean(img))

  // Extraire les dimensions du nom ou de la description
  let dimensions = "Non spécifié"
  const dimensionsRegex = /(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*(?:cm|mm|m)?/

  const nameMatch = product.name?.match(dimensionsRegex)
  const descMatch = product.short_description?.match(dimensionsRegex)

  if (nameMatch) {
    dimensions = `${nameMatch[1]} × ${nameMatch[2]} × ${nameMatch[3]} cm`
  } else if (descMatch) {
    dimensions = `${descMatch[1]} × ${descMatch[2]} × ${descMatch[3]} cm`
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="product-details-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div id="product-details-description" className="sr-only">
          Détails du produit {product.name}, référence {product.reference_code}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Galerie d'images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                {/* Image principale */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                  <SafeImage
                    src={images[currentImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={90}
                    productName={product.name}
                  />
                  
                  {/* Navigation des images */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Indicateur d'image */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square rounded border-2 overflow-hidden ${
                          index === currentImageIndex 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <SafeImage
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                          quality={75}
                          productName={product.name}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* Informations du produit */}
          <div className="space-y-4">
            {/* Référence et disponibilité */}
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded text-gray-700">
                {product.reference_code}
              </code>
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
            </div>

            {/* Prix et dimensions */}
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Prix TVAC</h3>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price_with_tax)}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Dimensions</h3>
                <Badge variant="outline" className="font-mono text-sm bg-blue-50 text-blue-700 border-blue-200">
                  {dimensions}
                </Badge>
              </div>
            </div>

            {/* Description avec onglets */}
            <div>
              <div className="flex border-b border-gray-200 mb-3">
                <button
                  onClick={() => setActiveTab('short')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                    activeTab === 'short'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informations
                  {activeTab === 'short' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                  )}
                </button>
                {product.description && (
                  <button
                    onClick={() => setActiveTab('full')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                      activeTab === 'full'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Détails
                    {activeTab === 'full' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                    )}
                  </button>
                )}
              </div>

              <div className="text-gray-700 leading-relaxed text-sm prose prose-sm max-w-none">
                {activeTab === 'short' ? (
                  product.short_description ? (
                    product.short_description.replace(/<[^>]*>/g, "")
                  ) : (
                    <span className="text-gray-400 italic">Aucune description disponible</span>
                  )
                ) : (
                  product.description?.replace(/<[^>]*>/g, "")
                )}
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="pt-2 border-t">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantité</h4>
                <p className="text-sm font-medium text-gray-900">{product.quantity || 0}</p>
              </div>
            </div>

            {/* Bouton d'action */}
            {product.product_link && (
              <Button
                asChild
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 mt-4"
              >
                <a
                  href={product.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">Commander ce produit</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 