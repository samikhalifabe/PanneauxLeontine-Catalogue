#!/usr/bin/env node

// Script simple pour tester la connexion à Neon
// Usage: npm run test-db-simple

const { Pool } = require('pg')

async function testNeonConnection() {
  // Lecture des variables d'environnement
  require('dotenv').config()
  
  const provider = process.env.DATABASE_PROVIDER || 'supabase'
  console.log('🔍 Test de connexion à la base de données...\n')
  console.log(`📊 Provider configuré: ${provider}`)
  
  if (provider !== 'neon') {
    console.log('⚠️  Ce script teste uniquement Neon. Pour Supabase, utilisez l\'ancien système.')
    console.log('💡 Pour tester Neon, définissez DATABASE_PROVIDER=neon dans votre .env')
    return
  }
  
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL manquant dans le fichier .env')
    console.error('💡 Ajoutez: DATABASE_URL=postgresql://neondb_owner:npg...@ep-...neon.tech/neondb?sslmode=require')
    process.exit(1)
  }
  
  console.log(`🔗 URL de connexion: ${connectionString.substring(0, 50)}...`)
  
  // Test de connexion
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    console.log('\n⏳ Connexion en cours...')
    
    // Test de base
    const client = await pool.connect()
    console.log('✅ Connexion Neon établie !')
    
    // Test des tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log(`\n📋 Tables trouvées: ${tablesResult.rows.length}`)
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`)
    })
    
    // Test des produits
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products')
    console.log(`\n📦 ${productsResult.rows[0].count} produits dans la base`)
    
    // Test des catégories
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories')
    console.log(`📂 ${categoriesResult.rows[0].count} catégories dans la base`)
    
    // Échantillon de produits
    const sampleResult = await client.query(`
      SELECT 
        p.id,
        p.nom_produit, 
        p.prix_final_ttc,
        STRING_AGG(c.name, ', ') as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      GROUP BY p.id, p.nom_produit, p.prix_final_ttc
      ORDER BY p.nom_produit
      LIMIT 5
    `)
    
    console.log('\n🎯 Échantillon de produits:')
    sampleResult.rows.forEach(row => {
      const price = row.prix_final_ttc ? `${row.prix_final_ttc}€` : 'Prix non défini'
      const categories = row.categories || 'Aucune catégorie'
      console.log(`   • ${row.nom_produit} (${price}) → ${categories}`)
    })
    
    client.release()
    console.log('\n🎉 Test terminé avec succès ! Votre base Neon est opérationnelle.')
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:')
    console.error(error.message)
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 L\'URL de connexion semble incorrecte. Vérifiez:')
      console.error('   - Le nom d\'hôte dans DATABASE_URL')
      console.error('   - Que votre projet Neon est actif')
    } else if (error.code === '28P01') {
      console.error('\n💡 Erreur d\'authentification. Vérifiez:')
      console.error('   - Le nom d\'utilisateur et mot de passe dans DATABASE_URL')
      console.error('   - Que les credentials sont corrects')
    } else {
      console.error('\n💡 Consultez la documentation Neon pour plus d\'aide')
    }
    
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testNeonConnection() 