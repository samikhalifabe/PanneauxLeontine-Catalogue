import { createClient } from "@supabase/supabase-js"

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function categoriserProduits() {
  try {
    console.log("Récupération de tous les produits...")
    const { data: products, error } = await supabase.from("products").select("*")

    if (error) {
      throw new Error(`Erreur lors de la récupération des produits: ${error.message}`)
    }

    console.log(`${products.length} produits trouvés.`)

    // Règles de catégorisation améliorées
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

    // Compteurs pour les statistiques
    const stats = {
      updated: 0,
      unchanged: 0,
      categoriesCounts: {},
    }

    // Traiter chaque produit
    for (const product of products) {
      const nomProduit = (product.name || "").toLowerCase()
      const descriptionProduit = (product.short_description || "").toLowerCase()
      const texteComplet = `${nomProduit} ${descriptionProduit}`

      let newCategory = "Divers"

      // Appliquer les règles de catégorisation
      for (const [pattern, category] of categorisationRules) {
        if (pattern.test(texteComplet)) {
          newCategory = category
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

    // Afficher les statistiques
    console.log("\nCatégorisation terminée!")
    console.log(`Produits mis à jour: ${stats.updated}`)
    console.log(`Produits inchangés: ${stats.unchanged}`)
    console.log("\nRépartition par catégorie:")

    Object.entries(stats.categoriesCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`${category}: ${count} produits`)
      })

    return {
      success: true,
      stats,
    }
  } catch (error) {
    console.error("Erreur lors de la catégorisation des produits:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Exécuter la catégorisation
const result = await categoriserProduits()
console.log("Résultat de la catégorisation:", result)
