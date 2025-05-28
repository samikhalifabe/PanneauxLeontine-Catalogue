import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { ProductGrid } from "@/components/product-grid"
import type { Product } from "@/types/product"

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", decodeURIComponent(category))
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }

  return data || []
}

async function getAllCategories(): Promise<string[]> {
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const decodedCategory = decodeURIComponent(params.category)
  const productsPromise = getProductsByCategory(decodedCategory)
  const categoriesPromise = getAllCategories()

  const [products, categories] = await Promise.all([productsPromise, categoriesPromise])

  if (products.length === 0 && !categories.includes(decodedCategory)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <div className="flex flex-col gap-2">
              <Link href="/categories" className="text-sm text-primary hover:underline">
                ← Toutes les catégories
              </Link>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{decodedCategory}</h1>
              <p className="mt-2 text-muted-foreground">
                {products.length} produit{products.length > 1 ? "s" : ""} dans cette catégorie
              </p>
            </div>
          </div>
        </section>

        <section className="container py-8">
          <ProductGrid products={products} categories={categories} />
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
