import { NextRequest, NextResponse } from 'next/server'
import { UnifiedProductService } from '@/lib/services/unified-product-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoriesParam = searchParams.get('categories')
    const selectedCategories = categoriesParam ? categoriesParam.split(',') : undefined

    const productService = UnifiedProductService.getInstance()
    const productsByCategory = await productService.getProductsByCategory(selectedCategories)

    return NextResponse.json({ 
      success: true, 
      data: productsByCategory 
    })
  } catch (error) {
    console.error('Erreur API products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
      },
      { status: 500 }
    )
  }
} 