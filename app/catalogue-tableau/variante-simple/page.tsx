"use client"

import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types/product"
import Link from "next/link"
import Image from "next/image"

// Importer le bouton de téléchargement PDF
import { PdfDownloadButton } from "@/components/pdf-download-button"

// Fonction pour récupérer tous les produits groupés par catégorie
async function getProductsByCategory(): Promise<Record<string, Product[]>> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("category", { ascending: true })

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

export default async function CatalogueTableauSimplePage() {
  const productsByCategory = await getProductsByCategory()
  const categories = Object.keys(productsByCategory).sort()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-8">
          <div className="container">
            {/* Modifier la section des boutons pour ajouter le bouton de téléchargement PDF */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Catalogue Simple</h1>
                <p className="mt-2 text-muted-foreground">Version simplifiée du catalogue en format tableau</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 print:hidden">
                <Button onClick={() => window.print()} size="lg">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer le catalogue
                </Button>
                <PdfDownloadButton documentTitle="Catalogue Simple Panneaux Léontine" />
              </div>
            </div>
          </div>
        </section>

        {/* En-tête pour la version imprimée */}
        <div className="hidden print:block print:mb-8">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo_kleur_2021.png" alt="Panneaux Léontine" className="h-16" />
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
          {/* Contenu du catalogue */}
          <div className="space-y-12">
            {categories.map((category) => (
              <section
                key={category}
                id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                className="print:break-inside-avoid-page"
              >
                <h2 className="text-2xl font-bold mb-6 bg-primary text-white p-3 print:mt-8">{category}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">REF</th>
                        <th className="border p-2 text-left">Produit</th>
                        <th className="border p-2 text-left">Photo</th>
                        <th className="border p-2 text-left">Prix TVAC / Pièce</th>
                        <th className="border p-2 text-left">Remarques</th>
                        <th className="border p-2 text-left">De stock à</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsByCategory[category].map((product) => {
                        // Utiliser un placeholder local si l'image est externe
                        const imageUrl = product.cover_image || "/wooden-panel-texture.png"
                        const isExternalImage = imageUrl.startsWith("http")
                        const safeImageUrl = isExternalImage
                          ? `/placeholder.svg?height=150&width=150&query=${encodeURIComponent(product.name || "produit")}`
                          : imageUrl

                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="border p-2">{product.reference_code}</td>
                            <td className="border p-2 font-medium">{product.name}</td>
                            <td className="border p-2">
                              <div className="relative h-24 w-24">
                                <Image
                                  src={safeImageUrl || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                                {isExternalImage && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                                    <span className="text-xs text-center p-1">
                                      {product.name?.substring(0, 20)}
                                      {product.name && product.name.length > 20 ? "..." : ""}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="border p-2 font-semibold text-primary">
                              {formatPrice(product.price_with_tax)}
                            </td>
                            <td className="border p-2 text-sm">
                              {product.short_description ? (
                                <span className="line-clamp-2">
                                  {product.short_description.replace(/<[^>]*>/g, "")}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="border p-2">
                              {product.availability ? (
                                <span className="text-green-600 font-medium">Assesse-Chaumont</span>
                              ) : (
                                <span className="text-gray-500">Sur commande</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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
