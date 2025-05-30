import { NextResponse } from 'next/server'
import { UnifiedProductService } from '@/lib/services/unified-product-service'

export async function GET() {
  try {
    const productService = UnifiedProductService.getInstance()
    
    const [categories, categoryCounts] = await Promise.all([
      productService.getAvailableCategories(),
      productService.getCategoriesWithCount()
    ])

    return NextResponse.json({ 
      success: true, 
      data: {
        categories,
        categoryCounts
      }
    })
  } catch (error) {
    console.error('Erreur API categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
      },
      { status: 500 }
    )
  }
} 