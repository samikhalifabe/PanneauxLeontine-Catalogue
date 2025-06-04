export interface Product {
  id: string
  name: string
  name_with_combination?: string
  short_description?: string
  description?: string
  reference_code: string
  availability: boolean
  quantity: number
  product_link?: string
  wholesale_price?: number
  price_without_tax?: number
  price_with_tax?: number
  cover_image?: string
  image_2?: string
  image_3?: string
  image_4?: string
  image_5?: string
  image_urls?: string
  category?: string
  created_at: string
  updated_at: string
}

export type ProductFilters = {
  category?: string
  availability?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
}
