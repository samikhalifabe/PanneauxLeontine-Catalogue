"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { Product, ProductFilters } from "@/types/product"
import { ProductCard } from "@/components/product-card"
import { ProductListItem } from "@/components/product-list-item"
import { ProductCompactCard } from "@/components/product-compact-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid, List, LayoutGrid } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  categories: string[]
}

type ViewMode = "grid" | "list" | "compact"

export function ProductGrid({ products, categories }: ProductGridProps) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [filters, setFilters] = useState<ProductFilters>({
    category: categoryParam || undefined,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Ajouter une fonction de tri par catégorie
  const sortOptions = [
    { value: "newest", label: "Plus récents" },
    { value: "oldest", label: "Plus anciens" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
    { value: "category", label: "Par catégorie" },
  ]

  // Ajouter un état pour le tri
  const [sortBy, setSortBy] = useState("newest")

  // Mettre à jour les filtres si le paramètre d'URL change
  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }))
    }
  }, [categoryParam])

  // Modifier la fonction de filtrage pour inclure le tri
  const filteredAndSortedProducts = products
    .filter((product) => {
      // Filtre par catégorie
      if (filters.category && product.category !== filters.category) {
        return false
      }

      // Filtre par disponibilité
      if (filters.availability !== undefined && product.availability !== filters.availability) {
        return false
      }

      // Filtre par prix
      if (filters.minPrice !== undefined && product.price_with_tax && product.price_with_tax < filters.minPrice) {
        return false
      }

      if (filters.maxPrice !== undefined && product.price_with_tax && product.price_with_tax > filters.maxPrice) {
        return false
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(query) ||
          (product.short_description && product.short_description.toLowerCase().includes(query)) ||
          product.reference_code.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price-asc":
          return (a.price_with_tax || 0) - (b.price_with_tax || 0)
        case "price-desc":
          return (b.price_with_tax || 0) - (a.price_with_tax || 0)
        case "category":
          return (a.category || "").localeCompare(b.category || "")
        default:
          return 0
      }
    })

  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }))
  }

  const handleAvailabilityFilter = (availability: boolean) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability === availability ? undefined : availability,
    }))
  }

  const handleResetFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-sm text-muted-foreground">
              Trier par:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === "grid" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Vue grille standard"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === "compact" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("compact")}
              title="Vue grille compacte"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === "list" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("list")}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filters.category === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter(category)}
          >
            {category}
          </Button>
        ))}
        <Button
          variant={filters.availability === true ? "default" : "outline"}
          size="sm"
          onClick={() => handleAvailabilityFilter(true)}
        >
          En stock
        </Button>
        {(filters.category || filters.availability !== undefined || searchQuery) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
          <p className="text-center text-muted-foreground">Aucun produit ne correspond à vos critères</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : viewMode === "compact" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCompactCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedProducts.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
