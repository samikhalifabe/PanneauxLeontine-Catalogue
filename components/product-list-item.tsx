import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Eye, Package, Tag } from "lucide-react"
import { formatPrice, sanitizeHtml } from "@/lib/utils"
import { SafeImage } from "@/components/safe-image"

interface ProductListItemProps {
  product: Product
  showCategory?: boolean
}

export function ProductListItem({ product, showCategory = true }: ProductListItemProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-gray-200 group">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden">
            <SafeImage
              src={product.cover_image}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 96px, 112px"
              loading="lazy"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
            />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Informations produit */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Titre et catégorie */}
                <div>
                  <Link href={`/produits/${product.id}`} className="group/link">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover/link:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {product.reference_code}
                    </span>
                    {showCategory && product.category && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {product.short_description && (
                  <div
                    className="text-sm text-muted-foreground line-clamp-2 description-html"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
                  />
                )}

                {/* Badges de statut */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={product.availability ? "default" : "secondary"}
                    className="text-xs"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {product.availability ? "En stock" : "Sur commande"}
                  </Badge>
                  {product.quantity > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {product.quantity} disponible{product.quantity > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Prix et actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 text-right">
                {/* Prix */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price_with_tax)}
                  </span>
                  <span className="text-xs text-muted-foreground">TTC</span>
                  {product.price_without_tax && (
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(product.price_without_tax)} HT
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/produits/${product.id}`}>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir le détail</span>
                    </Button>
                  </Link>
                  {product.product_link && (
                    <a 
                      href={product.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Lien externe</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
