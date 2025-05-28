import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catalogue Imprimable - Panneaux Léontine",
  description: "Version imprimable du catalogue de produits Panneaux Léontine",
}

export default function CatalogueImprimableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
