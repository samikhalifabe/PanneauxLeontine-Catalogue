"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function RecategoriserPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRecategorisation() {
    setIsProcessing(true)
    setError(null)

    try {
      const supabase = createClientSupabaseClient()

      // Règles de catégorisation
      const categorisationRules = [
        // Format: [regex pattern, category]
        [/\bbac(s)?\b|\bjardinière(s)?\b|\bpot(s)?\b/i, "Bacs"],
        [/\bpotager(s)?\b|\bcarré(s)? potager(s)?\b|\bpotager(s)? surélevé(s)?\b/i, "Potagers"],
        [/\bpanneau(x)?\b|\bpalissade(s)?\b|\bécran(s)?\b|\bséparation(s)?\b/i, "Panneaux"],
        [/\bterrasse(s)?\b|\bdalle(s)?\b|\bplatelage(s)?\b|\blame(s)? de terrasse\b/i, "Terrasses"],
        [/\bbardage(s)?\b|\bhabillage(s)?\b|\brevêtement(s)?\b/i, "Bardages"],
        [/\bclôture(s)?\b|\bcloture(s)?\b|\bpalissade(s)?\b|\bbarrière(s)?\b/i, "Clôtures"],
        [/\bjardinière(s)?\b|\bbac(s)? à fleurs\b|\bpot(s)? de fleurs\b/i, "Jardinières"],
        [/\btable(s)?\b|\bbanc(s)?\b|\bchaise(s)?\b|\bmobilier\b|\bmeuble(s)?\b/i, "Mobilier"],
        [/\bporte(s)?\b|\bportail(s)?\b|\bportillon(s)?\b/i, "Portes et Portails"],
        [/\babri(s)?\b|\bcabane(s)?\b|\bcarport(s)?\b/i, "Abris"],
        [/\bpergola(s)?\b|\bpergola(s)? bioclimatique(s)?\b/i, "Pergolas"],
        [/\bplanche(s)?\b|\bpoteau(x)?\b|\bsolive(s)?\b|\bmadrier(s)?\b/i, "Bois de Construction"],
      ]

      // Récupérer tous les produits
      const { data: products, error: fetchError } = await supabase.from("products").select("*")

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des produits: ${fetchError.message}`)
      }

      // Compteurs pour les statistiques
      const stats = {
        total: products.length,
        updated: 0,
        unchanged: 0,
        categoriesCounts: {} as Record<string, number>,
      }

      // Traiter chaque produit
      for (const product of products) {
        const nomProduit = (product.name || "").toLowerCase()
        const descriptionProduit = (product.short_description || "").toLowerCase()
        const texteComplet = `${nomProduit} ${descriptionProduit}`

        let newCategory = "Divers"

        // Appliquer les règles de catégorisation
        for (const [pattern, category] of categorisationRules) {
          if ((pattern as RegExp).test(texteComplet)) {
            newCategory = category as string
            break
          }
        }

        // Mettre à jour les statistiques
        stats.categoriesCounts[newCategory] = (stats.categoriesCounts[newCategory] || 0) + 1

        // Mettre à jour la catégorie si elle a changé
        if (product.category !== newCategory) {
          const { error: updateError } = await supabase
            .from("products")
            .update({ category: newCategory })
            .eq("id", product.id)

          if (updateError) {
            console.error(`Erreur lors de la mise à jour du produit ${product.id}: ${updateError.message}`)
          } else {
            stats.updated++
          }
        } else {
          stats.unchanged++
        }
      }

      setResults(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Recatégoriser les produits</h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              Cet outil va analyser tous les produits et leur attribuer des catégories en fonction de leur nom et
              description.
            </p>
          </div>
        </section>

        <section className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Lancer la recatégorisation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Cette opération va analyser tous les produits et mettre à jour leurs catégories en fonction de règles
                prédéfinies. Les produits seront classés dans des catégories comme "Panneaux", "Terrasses", "Bardages",
                etc.
              </p>

              <Button onClick={handleRecategorisation} disabled={isProcessing} className="mb-6">
                {isProcessing ? "Traitement en cours..." : "Lancer la recatégorisation"}
              </Button>

              {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

              {results && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Résultats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Total des produits</p>
                      <p className="text-2xl font-bold">{results.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Produits mis à jour</p>
                      <p className="text-2xl font-bold text-green-700">{results.updated}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">Produits inchangés</p>
                      <p className="text-2xl font-bold">{results.unchanged}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">Répartition par catégorie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(results.categoriesCounts)
                      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                      .map(([category, count]) => (
                        <div key={category} className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium">{category}</p>
                          <p className="text-lg">{count} produits</p>
                        </div>
                      ))}
                  </div>

                  <div className="mt-6">
                    <Button onClick={() => router.push("/admin/categories")}>Retour à la gestion des catégories</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
