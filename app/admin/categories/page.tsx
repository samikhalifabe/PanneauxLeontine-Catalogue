import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryCount {
  category: string
  count: number
}

async function getCategoriesWithCounts(): Promise<CategoryCount[]> {
  const supabase = createServerSupabaseClient()

  // Récupérer toutes les catégories avec le nombre de produits
  const { data, error } = await supabase.from("products").select("category").not("category", "is", null)

  if (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return []
  }

  // Compter le nombre de produits par catégorie
  const categoryCounts: Record<string, number> = {}
  data.forEach((item) => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    }
  })

  // Convertir en tableau pour l'affichage
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Gestion des catégories</h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              Gérez les catégories de produits et leur organisation.
            </p>
          </div>
        </section>

        <section className="container py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Catégories actuelles</h2>
            <Button asChild>
              <Link href="/admin/categories/recategoriser">Recatégoriser les produits</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card key={cat.category}>
                <CardHeader className="pb-2">
                  <CardTitle>{cat.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">{cat.count} produits</p>
                    <Button variant="outline" asChild>
                      <Link href={`/admin/categories/${encodeURIComponent(cat.category)}`}>Voir les produits</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
