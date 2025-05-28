import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, sanitizeHtml } from "@/lib/utils"
import type { Product } from "@/types/product"

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour au catalogue
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={product.cover_image || "/placeholder.svg?height=600&width=600&query=panneau+en+bois"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {product.image_2 && (
                  <div className="relative aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={product.image_2 || "/placeholder.svg"}
                      alt={`${product.name} - Vue supplémentaire 1`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                )}
                {product.image_3 && (
                  <div className="relative aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={product.image_3 || "/placeholder.svg"}
                      alt={`${product.name} - Vue supplémentaire 2`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.name_with_combination && (
                  <p className="text-lg text-muted-foreground">{product.name_with_combination}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={product.availability ? "success" : "secondary"}>
                    {product.availability ? "En stock" : "Sur commande"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Réf: {product.reference_code}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold">Description</h2>
                {product.short_description ? (
                  <div
                    className="text-muted-foreground description-html"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
                  />
                ) : (
                  <p className="text-muted-foreground">Aucune description disponible</p>
                )}
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold">Informations</h2>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex justify-between border-b py-2">
                    <dt className="text-muted-foreground">Catégorie</dt>
                    <dd className="font-medium">{product.category || "Non spécifiée"}</dd>
                  </div>
                  <div className="flex justify-between border-b py-2">
                    <dt className="text-muted-foreground">Quantité disponible</dt>
                    <dd className="font-medium">{product.quantity}</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold">Prix</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">Prix HT</span>
                    <span className="font-medium">{formatPrice(product.price_without_tax)}</span>
                  </div>
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">Prix TTC</span>
                    <span className="font-medium text-primary">{formatPrice(product.price_with_tax)}</span>
                  </div>
                  {product.wholesale_price && (
                    <div className="flex justify-between border-b py-2">
                      <span className="text-muted-foreground">Prix de gros</span>
                      <span className="font-medium">{formatPrice(product.wholesale_price)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link
                    href={product.product_link || "https://eshop.example.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur l'E-Shop
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 bg-gray-50">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Panneaux Léontine. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:underline">
              Mentions légales
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
