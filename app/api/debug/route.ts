import { NextResponse } from 'next/server'
import { UnifiedProductService } from '@/lib/services/unified-product-service'

export async function GET() {
  try {
    const service = UnifiedProductService.getInstance()
    
    // Vider le cache
    service.clearCache()
    console.log('Cache vidé')
    
    // Tester la récupération des catégories
    const categoriesWithCount = await service.getCategoriesWithCount()
    console.log('Categories avec comptage:', Object.keys(categoriesWithCount).length)
    
    // Tester la récupération des produits
    const productsByCategory = await service.getProductsByCategory()
    const totalProducts = Object.values(productsByCategory).reduce((sum, products) => sum + products.length, 0)
    console.log('Total produits récupérés:', totalProducts)
    
    // Tester une catégorie spécifique
    const amenagements = await service.getProductsByCategory(['Aménagements extérieurs'])
    console.log('Produits Aménagements extérieurs:', amenagements['Aménagements extérieurs']?.length || 0)
    
    return NextResponse.json({
      success: true,
      cache_cleared: true,
      categories_count: Object.keys(categoriesWithCount).length,
      total_products: totalProducts,
      amenagements_count: amenagements['Aménagements extérieurs']?.length || 0,
      sample_categories: Object.entries(categoriesWithCount).slice(0, 5),
      sample_products: amenagements['Aménagements extérieurs']?.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        has_cover_image: !!p.cover_image
      })) || []
    })
  } catch (error) {
    console.error('Erreur debug:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 