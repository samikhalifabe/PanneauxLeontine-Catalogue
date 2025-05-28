"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import Script from "next/script"

interface PdfDownloadButtonProps {
  documentTitle: string
}

export function PdfDownloadButton({ documentTitle }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handleDownload = async () => {
    if (!scriptLoaded) {
      alert("Le script de génération PDF est en cours de chargement. Veuillez réessayer dans quelques secondes.")
      return
    }

    setIsGenerating(true)

    try {
      // Accéder à html2pdf via window
      const html2pdf = (window as any).html2pdf

      if (!html2pdf) {
        throw new Error("La bibliothèque html2pdf n'est pas disponible")
      }

      // Sélectionner uniquement les sections de catégories visibles
      const sections = document.querySelectorAll('section[id^="category-"]:not(.hidden)')
      if (!sections || sections.length === 0) {
        throw new Error("Aucune catégorie sélectionnée pour l'export PDF")
      }

      // Créer un conteneur pour le PDF avec uniquement le contenu nécessaire
      const pdfContainer = document.createElement("div")
      pdfContainer.style.padding = "20px"
      pdfContainer.style.backgroundColor = "white"

      // Ajouter un en-tête
      const header = document.createElement("div")
      header.style.marginBottom = "20px"
      header.style.paddingBottom = "10px"
      header.style.borderBottom = "1px solid #ddd"
      header.innerHTML = `
        <h1 style="font-size: 24px; margin: 0;">Catalogue de Produits - Panneaux Léontine</h1>
        <p style="margin: 5px 0 0 0;">Date: ${new Date().toLocaleDateString("fr-FR")}</p>
      `
      pdfContainer.appendChild(header)

      // Ajouter chaque section de catégorie
      sections.forEach((section, index) => {
        // Cloner la section pour ne pas modifier l'original
        const sectionClone = section.cloneNode(true) as HTMLElement

        // Ajouter un saut de page avant chaque section sauf la première
        if (index > 0) {
          const pageBreak = document.createElement("div")
          pageBreak.style.pageBreakBefore = "always"
          pdfContainer.appendChild(pageBreak)
        }

        // Optimiser les images dans cette section
        const images = sectionClone.querySelectorAll("img")
        images.forEach((img) => {
          // Conserver l'image mais optimiser ses attributs
          img.style.maxWidth = "100px"
          img.style.maxHeight = "100px"
          img.style.objectFit = "contain"

          // Utiliser des placeholders pour les images externes
          const src = img.getAttribute("src") || ""
          if (src.startsWith("http") || src.includes("/_next/image")) {
            const altText = img.getAttribute("alt") || "produit"
            img.setAttribute("src", `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(altText)}`)
          }
        })

        pdfContainer.appendChild(sectionClone)
      })

      // Configurer les options pour html2pdf
      const options = {
        margin: 10,
        filename: `${documentTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`,
        image: { type: "jpeg", quality: 0.8 }, // Réduire la qualité pour optimiser
        html2canvas: {
          scale: 1, // Réduire l'échelle pour éviter les problèmes de mémoire
          logging: false,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
          compress: true,
          hotfixes: ["px_scaling"],
        },
        pagebreak: { mode: "avoid-all" },
      }

      // Ajouter le conteneur temporairement au document
      document.body.appendChild(pdfContainer)
      pdfContainer.style.position = "absolute"
      pdfContainer.style.left = "-9999px"

      // Générer le PDF
      await html2pdf().from(pdfContainer).set(options).save()

      // Nettoyer
      document.body.removeChild(pdfContainer)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert(
        `Une erreur est survenue lors de la génération du PDF: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* Charger le script html2pdf.js depuis CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => alert("Impossible de charger la bibliothèque de génération PDF")}
      />

      <Button onClick={handleDownload} disabled={isGenerating || !scriptLoaded} variant="outline" size="lg">
        <FileDown className="mr-2 h-4 w-4" />
        {isGenerating ? "Génération en cours..." : "Télécharger les catégories en PDF"}
      </Button>
    </>
  )
}
