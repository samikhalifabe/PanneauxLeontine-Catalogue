#!/usr/bin/env node

// Script pour tester la connexion à la base de données
// Usage: npm run test-db

import { getDatabaseConfig } from '../lib/database-config'
import { getDatabaseClient } from '../lib/database-clients'

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...\n')
    
    // Afficher la configuration
    const config = getDatabaseConfig()
    console.log(`📊 Provider: ${config.provider}`)
    
    if (config.provider === 'neon') {
      console.log(`🔗 URL de connexion: ${config.connectionString?.substring(0, 50)}...`)
    } else {
      console.log(`🔗 URL Supabase: ${config.supabase?.url}`)
    }
    
    // Tester la connexion
    console.log('\n⏳ Connexion en cours...')
    const client = await getDatabaseClient()
    
    // Test simple
    if (config.provider === 'neon') {
      const result = await client.query('SELECT COUNT(*) as count FROM products')
      console.log(`✅ Connexion Neon réussie ! ${result.rows[0].count} produits trouvés.`)
      
      // Test des catégories
      const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories')
      console.log(`📂 ${categoriesResult.rows[0].count} catégories trouvées.`)
      
      // Test d'une requête plus complexe
      const sampleResult = await client.query(`
        SELECT 
          p.nom_produit, 
          STRING_AGG(c.name, ', ') as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        GROUP BY p.id, p.nom_produit
        LIMIT 3
      `)
      
      console.log('\n📋 Échantillon de produits avec catégories :')
      sampleResult.rows.forEach(row => {
        console.log(`   • ${row.nom_produit} → ${row.categories || 'Aucune catégorie'}`)
      })
      
    } else {
      const products = await client.select('products', { limit: 1 })
      console.log(`✅ Connexion Supabase réussie ! ${products.length} produit(s) testé(s).`)
      
      if (products.length > 0) {
        console.log(`   • Exemple: ${products[0].name || products[0].nom_produit}`)
      }
    }
    
    console.log('\n🎉 Test terminé avec succès !')
    
    // Fermer proprement les connexions
    process.exit(0)
    
  } catch (error: any) {
    console.error('\n❌ Erreur de connexion:')
    console.error(error.message)
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Pour Neon, ajoutez dans votre .env :')
      console.error('   DATABASE_PROVIDER=neon')
      console.error('   DATABASE_URL=postgresql://neondb_owner:npg...@ep-...neon.tech/neondb?sslmode=require')
    } else if (error.message.includes('Supabase')) {
      console.error('\n💡 Pour Supabase, ajoutez dans votre .env :')
      console.error('   DATABASE_PROVIDER=supabase')
      console.error('   SUPABASE_URL=https://your-project.supabase.co')
      console.error('   SUPABASE_ANON_KEY=your-anon-key')
    } else {
      console.error('\n💡 Vérifiez vos variables d\'environnement dans le fichier .env')
      console.error('   Consultez DATABASE_SETUP.md pour plus d\'informations')
    }
    
    process.exit(1)
  }
}

// Exécuter le test
testConnection() 