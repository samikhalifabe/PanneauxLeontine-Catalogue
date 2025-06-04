import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, sanitizeHtml } from "@/lib/utils"
import { SafeImage } from "@/components/safe-image"
import { Eye, ExternalLink, Package } from "lucide-react"

interface ProductMobileCardProps {
  product: Product
}

export function ProductMobileCard({ product }: ProductMobileCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 group">
      <div className="relative">
        {/* Image principale - plus grande pour mobile */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Link href={`/produits/${product.id}`}>
            <SafeImage
              src={product.cover_image || "/placeholder.svg?height=300&width=400&query=panneau+en+bois"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
              quality={80}
              productName={product.name}
            />
          </Link>
          
          {/* Badge de disponibilité */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={product.availability ? "default" : "secondary"}
              className="text-xs font-medium shadow-sm"
            >
              <Package className="w-3 h-3 mr-1" />
              {product.availability ? "En stock" : "Sur commande"}
            </Badge>
          </div>
        </div>

        {/* Contenu de la carte */}
        <CardContent className="p-4">
          {/* Titre et référence */}
          <div className="mb-3">
            <Link href={`/produits/${product.id}`} className="group/link">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover/link:text-primary transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Réf: {product.reference_code}
            </p>
          </div>

          {/* Description courte si disponible */}
          {product.short_description && (
            <div 
              className="text-sm text-muted-foreground line-clamp-2 mb-3 description-html"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
            />
          )}

          {/* Prix et quantité */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(product.price_with_tax)}
              </div>
              <div className="text-xs text-muted-foreground">TTC</div>
            </div>
            {product.quantity > 0 && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {product.quantity} disponible{product.quantity > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Actions - optimisées pour mobile */}
          <div className="flex gap-2">
            <Link href={`/produits/${product.id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-11 text-sm font-medium"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Button>
            </Link>
            {product.product_link && (
              <a 
                href={product.product_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button 
                  className="w-full h-11 text-sm font-medium bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Commander
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
} 