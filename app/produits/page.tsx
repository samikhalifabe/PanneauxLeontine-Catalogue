import Link from "next/link"
import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ProductGrid } from "@/components/product-grid"
import { SiteHeader } from "@/components/site-header"
import type { Product } from "@/types/product"

async function getProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

async function getCategories(): Promise<string[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("category").not("category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // Extraire les catégories uniques
  const categories = [...new Set(data.map((item) => item.category))]
  return categories.filter(Boolean) as string[]
}

export default async function ProduitsPage() {
  const productsPromise = getProducts()
  const categoriesPromise = getCategories()

  const [products, categories] = await Promise.all([productsPromise, categoriesPromise])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Nos Produits</h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              Découvrez notre sélection de panneaux en bois, planches et autres produits pour vos projets de terrasse et
              d'aménagement extérieur.
            </p>
          </div>
        </section>
        <section className="container py-8">
          <Suspense fallback={<div>Chargement des produits...</div>}>
            <ProductGrid products={products} categories={categories} />
          </Suspense>
        </section>
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
