"use client"

import Image from "next/image"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { formatPrice, sanitizeHtml } from "@/lib/utils"
import type { Product } from "@/types/product"

// Fonction pour récupérer tous les produits groupés par catégorie
async function getProductsByCategory(): Promise<Record<string, Product[]>> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return {}
  }

  // Grouper les produits par catégorie
  const productsByCategory: Record<string, Product[]> = {}
  data.forEach((product) => {
    const category = product.category || "Non classé"
    if (!productsByCategory[category]) {
      productsByCategory[category] = []
    }
    productsByCategory[category].push(product)
  })

  return productsByCategory
}

export default async function CatalogueImprimablePage() {
  const productsByCategory = await getProductsByCategory()
  const categories = Object.keys(productsByCategory).sort()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explorer</h1>
                <p className="mt-2 text-muted-foreground">Version imprimable de notre catalogue de produits</p>
              </div>
              <Button onClick={() => window.print()} className="mt-4 md:mt-0 print:hidden" size="lg">
                <Printer className="mr-2 h-4 w-4" />
                Imprimer le catalogue
              </Button>
            </div>
          </div>
        </section>

        {/* En-tête pour la version imprimée */}
        <div className="hidden print:block print:mb-8">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo_kleur_2021.png"
                  alt="Panneaux Léontine"
                  width={150}
                  height={50}
                  className="print:block"
                />
                <div>
                  <h1 className="text-2xl font-bold">Catalogue de Produits</h1>
                  <p className="text-sm text-muted-foreground">
                    Panneaux Léontine - {new Date().toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p>Rue des Tiges 2</p>
                <p>5330 Assesse (Belgique)</p>
                <p>+32(0)487 27 07 19</p>
                <p>info@panneauxleontine.be</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Table des matières pour la version imprimée */}
          <div className="mb-8 print:mb-12 hidden print:block">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Table des matières</h2>
            <ul className="columns-2 sm:columns-3 gap-8">
              {categories.map((category) => (
                <li key={category} className="mb-2">
                  <a href={`#category-${category.replace(/\s+/g, "-").toLowerCase()}`} className="hover:text-primary">
                    {category} ({productsByCategory[category].length})
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contenu du catalogue */}
          <div className="space-y-12">
            {categories.map((category) => (
              <section
                key={category}
                id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                className="print:break-inside-avoid-page"
              >
                <h2 className="text-2xl font-bold mb-6 border-b border-primary pb-2 print:mt-8">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                  {productsByCategory[category].map((product) => (
                    <div key={product.id} className="flex border rounded-md overflow-hidden print:break-inside-avoid">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={product.cover_image || "/placeholder.svg?height=150&width=150&query=panneau+en+bois"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="p-3 flex-grow">
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <div
                          className="text-xs text-muted-foreground mt-1 line-clamp-2 description-html"
                          dangerouslySetInnerHTML={{
                            __html: product.short_description
                              ? sanitizeHtml(product.short_description)
                              : "Aucune description disponible",
                          }}
                        />
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(product.price_with_tax)}
                          </span>
                          <span className="text-xs text-muted-foreground">Réf: {product.reference_code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Pied de page pour la version imprimée */}
        <div className="hidden print:block print:fixed print:bottom-0 print:w-full print:border-t print:py-2">
          <div className="container">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Panneaux Léontine - Catalogue {new Date().toLocaleDateString("fr-FR")}</span>
              <span>www.panneauxleontine.be</span>
              <span className="print-page-number"></span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-gray-50 print:hidden">
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
