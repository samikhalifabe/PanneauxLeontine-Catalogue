import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice, sanitizeHtml } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all product-card-hover border-gray-200">
      <Link href={`/produits/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.cover_image || "/placeholder.svg?height=300&width=300&query=panneau+en+bois"}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
          />
          {product.availability ? (
            <Badge variant="success" className="absolute top-2 right-2 z-10">
              En stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10">
              Sur commande
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold line-clamp-2 text-gray-800">{product.name}</h3>
          </div>
          {product.short_description && (
            <div
              className="text-sm text-muted-foreground line-clamp-2 description-html"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
            />
          )}
          <div className="mt-2 text-xs text-muted-foreground">Réf: {product.reference_code}</div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4 bg-gray-50">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
            <span className="text-xs text-muted-foreground">TTC</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {product.quantity > 0 ? `${product.quantity} disponibles` : "Sur commande"}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
