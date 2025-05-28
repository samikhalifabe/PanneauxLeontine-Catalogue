import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice, sanitizeHtml } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const productDisplayVariants = cva(
  "overflow-hidden transition-all product-card-hover border-gray-200",
  {
    variants: {
      variant: {
        card: "h-full",
        compact: "h-full",
        list: "flex-row h-auto"
      },
      size: {
        default: "",
        small: "",
        large: ""
      }
    },
    defaultVariants: {
      variant: "card",
      size: "default"
    }
  }
)

const imageConfig = {
  card: {
    quality: 75,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    placeholder: "300x300"
  },
  compact: {
    quality: 70,
    sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw",
    placeholder: "200x200"
  },
  list: {
    quality: 80,
    sizes: "80px",
    placeholder: "80x80"
  }
}

interface ProductDisplayProps extends VariantProps<typeof productDisplayVariants> {
  product: Product
  showDescription?: boolean
  showCategory?: boolean
  className?: string
}

export function ProductDisplay({ 
  product, 
  variant = "card", 
  size = "default",
  showDescription = true,
  showCategory = false,
  className 
}: ProductDisplayProps) {
  const config = imageConfig[variant!]
  
  const renderBadge = () => (
    product.availability ? (
      <Badge 
        variant="success" 
        className={cn(
          "absolute z-10",
          variant === "compact" ? "top-1 right-1 text-[10px] px-1.5 py-0" : "top-2 right-2"
        )}
      >
        En stock
      </Badge>
    ) : (
      <Badge 
        variant="secondary" 
        className={cn(
          "absolute z-10",
          variant === "compact" ? "top-1 right-1 text-[10px] px-1.5 py-0" : "top-2 right-2"
        )}
      >
        Sur commande
      </Badge>
    )
  )

  const renderImage = () => (
    <div className={cn(
      "relative overflow-hidden",
      variant === "list" ? "w-20 h-20 flex-shrink-0" : "aspect-square"
    )}>
      <Image
        src={product.cover_image || `/placeholder.svg?height=${config.placeholder}&width=${config.placeholder}&query=panneau+en+bois`}
        alt={product.name}
        fill
        className="object-cover transition-transform hover:scale-105"
        sizes={config.sizes}
        loading="lazy"
        quality={config.quality}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoFdQowcKAQ4eGgfJ4yCyJFfSBLFLKA="
      />
      {renderBadge()}
    </div>
  )

  const renderContent = () => {
    if (variant === "list") {
      return (
        <div className="flex-1 p-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate text-gray-800">{product.name}</h3>
            <div className="text-xs text-muted-foreground">Réf: {product.reference_code}</div>
            {showCategory && product.category && (
              <div className="text-xs text-muted-foreground">{product.category}</div>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="font-semibold text-primary">{formatPrice(product.price_with_tax)}</div>
            <div className="text-xs text-muted-foreground">
              {product.quantity > 0 ? `${product.quantity} dispo.` : "Sur commande"}
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        <CardContent className={cn(
          variant === "compact" ? "p-2" : "p-4"
        )}>
          <div className={cn(variant === "compact" ? "mb-1" : "mb-2")}>
            <h3 className={cn(
              "font-semibold text-gray-800",
              variant === "compact" ? "text-sm line-clamp-1" : "line-clamp-2"
            )}>
              {product.name}
            </h3>
          </div>
          
          {showDescription && product.short_description && variant !== "compact" && (
            <div
              className="text-sm text-muted-foreground line-clamp-2 description-html"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
            />
          )}
          
          {variant === "compact" ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
              {showCategory && <span className="text-xs text-muted-foreground">{product.category}</span>}
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">Réf: {product.reference_code}</div>
          )}
        </CardContent>
        
        {variant === "card" && (
          <CardFooter className="flex items-center justify-between border-t p-4 bg-gray-50">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-primary">{formatPrice(product.price_with_tax)}</span>
              <span className="text-xs text-muted-foreground">TTC</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {product.quantity > 0 ? `${product.quantity} disponibles` : "Sur commande"}
            </div>
          </CardFooter>
        )}
      </>
    )
  }

  return (
    <Card className={cn(productDisplayVariants({ variant, size }), className)}>
      <Link href={`/produits/${product.id}`} className={cn(
        "block",
        variant === "list" ? "flex h-full" : "h-full"
      )}>
        {renderImage()}
        {renderContent()}
      </Link>
    </Card>
  )
} 