import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, sanitizeHtml } from "@/lib/utils"

interface ProductListItemProps {
  product: Product
}

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <Card className="overflow-hidden transition-all product-card-hover border-gray-200">
      <Link href={`/produits/${product.id}`} className="block">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={product.cover_image || "/placeholder.svg?height=80&width=80&query=panneau+en+bois"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
                quality={70}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
              />
              {product.availability ? (
                <Badge variant="success" className="absolute top-1 right-1 text-xs px-1 py-0">
                  En stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="absolute top-1 right-1 text-xs px-1 py-0">
                  Sur commande
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-1 text-gray-800">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">Réf: {product.reference_code}</p>
                  {product.short_description && (
                    <div
                      className="text-sm text-muted-foreground line-clamp-2 mt-1 description-html"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
                    />
                  )}
                </div>
                <div className="flex flex-col items-end text-right ml-4">
                  <span className="text-lg font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
                  <span className="text-xs text-muted-foreground">TTC</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {product.quantity > 0 ? `${product.quantity} disponibles` : "Sur commande"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
