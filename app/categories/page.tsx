import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"

interface CategoryWithCount {
  category: string
  count: number
}

// Image par défaut pour toutes les catégories
const DEFAULT_IMAGE = "/wooden-product-display.png"

// Images représentatives pour chaque catégorie
const categoryImages: Record<string, string> = {
  // Catégories existantes
  Terrasses: "/wooden-terrace-garden.png",
  Panneaux: "/wooden-panel-texture.png",
  Planches: "/wooden-plank-texture.png",
  Bardages: "/wooden-cladding-detail.png",
  Clôtures: "/wooden-garden-fence.png",
  Bacs: "/assorted-wooden-products.png",
  Potagers: "/assorted-wooden-products.png",
  Jardinières: "/assorted-wooden-products.png",
  Mobilier: "/assorted-wooden-products.png",
  "Portes et Portails": "/assorted-wooden-products.png",
  Abris: "/assorted-wooden-products.png",
  Pergolas: "/assorted-wooden-products.png",
  "Bois de Construction": "/assorted-wooden-products.png",
  Divers: "/assorted-wooden-products.png",
}

// Fonction pour obtenir une image pour une catégorie
function getCategoryImage(category: string): string {
  // Si la catégorie est vide ou non définie, retourner l'image par défaut
  if (!category) {
    return DEFAULT_IMAGE
  }

  // Si nous avons une image directement associée à cette catégorie
  if (categoryImages[category]) {
    return categoryImages[category]
  }

  // Sinon, utiliser l'image par défaut
  return DEFAULT_IMAGE
}

async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = createServerSupabaseClient()

  // Récupérer toutes les catégories avec le nombre de produits dans chacune
  const { data, error } = await supabase.from("products").select("category").not("category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
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
    .sort((a, b) => a.category.localeCompare(b.category))
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Catégories</h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              Parcourez notre catalogue par catégorie pour trouver rapidement les produits qui vous intéressent.
            </p>
          </div>
        </section>

        <section className="container py-8">
          {categories.length === 0 ? (
            <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
              <p className="text-center text-muted-foreground">Aucune catégorie disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                // Garantir que nous avons une catégorie valide
                if (!cat.category) return null

                // Obtenir l'image de la catégorie avec une valeur par défaut sécurisée
                const imageSrc = getCategoryImage(cat.category)

                return (
                  <Card
                    key={cat.category}
                    className="overflow-hidden transition-all hover:shadow-lg product-card-hover"
                  >
                    <Link href={`/categories/${encodeURIComponent(cat.category)}`} className="block">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={imageSrc || "/placeholder.svg"}
                          alt={`Catégorie ${cat.category}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <h2 className="text-xl font-bold">{cat.category}</h2>
                            <p className="text-sm">
                              {cat.count} produit{cat.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                )
              })}
            </div>
          )}
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
