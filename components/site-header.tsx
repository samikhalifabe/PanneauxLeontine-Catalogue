"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShoppingCart } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo_kleur_2021.png" 
              alt="Panneaux Léontine" 
              width={180} 
              height={60} 
              priority 
              style={{ height: "auto" }}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link
              href="http://shop.panneauxleontine.be/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>E-shop</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
