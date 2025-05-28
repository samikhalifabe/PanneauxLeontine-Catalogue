import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catalogue Format Tableau - Panneaux Léontine",
  description: "Consultez notre catalogue de produits dans un format tabulaire facile à imprimer",
}

export default function CatalogueTableauLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
