import { NextRequest, NextResponse } from 'next/server'
import { UnifiedProductService } from '@/lib/services/unified-product-service'

export async function GET(request: NextRequest) {
  try {
    const service = UnifiedProductService.getInstance()
    
    // Récupérer les catégories sélectionnées depuis les paramètres
    const { searchParams } = new URL(request.url)
    const categoriesParam = searchParams.get('categories')
    const selectedCategories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : undefined
    
    // Récupérer le nombre unique de produits
    const count = await service.getUniqueProductsCountForCategories(selectedCategories)
    
    return NextResponse.json({
      success: true,
      count
    })
  } catch (error) {
    console.error('Erreur dans /api/products/count:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 