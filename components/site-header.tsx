"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShoppingCart } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo_kleur_2021.png" 
              alt="Panneaux Léontine" 
              width={180} 
              height={60} 
              priority 
              style={{ height: "auto" }}
            />
          </Link>
        </div>
        <div>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link
              href="http://shop.panneauxleontine.be/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Visiter notre E-Shop</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
