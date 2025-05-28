import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface ProductCompactCardProps {
  product: Product
}

export function ProductCompactCard({ product }: ProductCompactCardProps) {
  return (
    <Card className="overflow-hidden transition-all product-card-hover border-gray-200 h-full">
      <Link href={`/produits/${product.id}`} className="block h-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.cover_image || "/placeholder.svg?height=200&width=200&query=panneau+en+bois"}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            loading="lazy"
            quality={70}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
          />
          {product.availability ? (
            <Badge variant="success" className="absolute top-1 right-1 text-[10px] px-1.5 py-0">
              En stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] px-1.5 py-0">
              Sur commande
            </Badge>
          )}
        </div>
        <CardContent className="p-2">
          <div className="mb-1">
            <h3 className="font-medium text-sm line-clamp-1 text-gray-800">{product.name}</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
            <span className="text-xs text-muted-foreground">{product.category}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
