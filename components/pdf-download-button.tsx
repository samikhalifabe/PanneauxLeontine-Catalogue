"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PdfDownloadButtonProps {
  documentTitle: string
  size?: "sm" | "lg" | "default"
  className?: string
}

export function PdfDownloadButton({ documentTitle, size = "lg", className }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    console.log("🔄 Début de la génération PDF...")

    try {
      // Sélectionner toutes les sections de catégories
      let sections = document.querySelectorAll('section[id^="category-"]')
      console.log(`📊 Sections trouvées: ${sections.length}`)
      
      if (!sections || sections.length === 0) {
        console.error("❌ Aucune section trouvée")
        // Essayons une approche différente - chercher tous les éléments avec des IDs category
        sections = document.querySelectorAll('[id*="category"]')
        console.log(`🔍 Sections alternatives trouvées: ${sections.length}`)
        
        if (sections.length === 0) {
          throw new Error("Aucune catégorie trouvée pour l'export PDF. Assurez-vous d'être sur la page du catalogue.")
        }
      }

      console.log("🎯 Sections sélectionnées pour le PDF:")
      sections.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.id} - ${section.querySelector('h2')?.textContent || 'Sans titre'}`)
      })

      // Créer un conteneur temporaire pour le PDF
      const pdfContainer = document.createElement("div")
      pdfContainer.id = "pdf-export-container"
      pdfContainer.style.width = "800px" // Largeur fixe pour la cohérence
      pdfContainer.style.padding = "20px"
      pdfContainer.style.backgroundColor = "white"
      pdfContainer.style.fontFamily = "Arial, sans-serif"
      pdfContainer.style.position = "absolute"
      pdfContainer.style.left = "-9999px"
      pdfContainer.style.top = "0"
      pdfContainer.style.zIndex = "-1000"

      // Ajouter un en-tête au PDF
      const header = document.createElement("div")
      header.style.marginBottom = "30px"
      header.style.paddingBottom = "20px"
      header.style.borderBottom = "2px solid #333"
      header.style.textAlign = "center"
      header.innerHTML = `
        <h1 style="font-size: 28px; margin: 0; color: #333; font-weight: bold;">Catalogue de Produits</h1>
        <h2 style="font-size: 20px; margin: 10px 0; color: #666;">Panneaux Léontine</h2>
        <p style="margin: 10px 0; font-size: 14px; color: #888;">Date: ${new Date().toLocaleDateString("fr-FR")}</p>
      `
      pdfContainer.appendChild(header)

      console.log("📝 Traitement des sections...")

      // Ajouter chaque section de catégorie au conteneur
      sections.forEach((section, index) => {
        console.log(`  📄 Traitement section ${index + 1}: ${section.id}`)
        
        const sectionClone = section.cloneNode(true) as HTMLElement
        
        // Nettoyer et optimiser le contenu pour le PDF
        const categoryTitle = sectionClone.querySelector('h2')
        if (categoryTitle) {
          categoryTitle.style.fontSize = "24px"
          categoryTitle.style.marginBottom = "20px"
          categoryTitle.style.marginTop = index > 0 ? "40px" : "20px"
          categoryTitle.style.color = "#333"
          categoryTitle.style.backgroundColor = "#f5f5f5"
          categoryTitle.style.padding = "10px"
          categoryTitle.style.borderRadius = "5px"
        }

        // Optimiser les tableaux
        const tables = sectionClone.querySelectorAll("table")
        tables.forEach((table) => {
          table.style.width = "100%"
          table.style.borderCollapse = "collapse"
          table.style.marginBottom = "20px"
          
          // Optimiser les cellules
          const cells = table.querySelectorAll("td, th")
          cells.forEach((cell) => {
            const htmlCell = cell as HTMLElement
            htmlCell.style.border = "1px solid #ddd"
            htmlCell.style.padding = "8px"
            htmlCell.style.fontSize = "12px"
            htmlCell.style.lineHeight = "1.4"
          })
        })

        // Optimiser les images
        const images = sectionClone.querySelectorAll("img")
        console.log(`    🖼️  Images trouvées: ${images.length}`)
        
        images.forEach((img, imgIndex) => {
          img.style.maxWidth = "60px"
          img.style.maxHeight = "60px"
          img.style.objectFit = "contain"
          img.style.display = "block"
          
          // Remplacer par un placeholder simple si problème de chargement
          if (!img.complete || img.naturalHeight === 0 || img.src.includes('/_next/image')) {
            console.log(`    ⚠️  Remplacement image ${imgIndex + 1} par placeholder`)
            img.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f0f0f0%22/%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2210%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23999%22%3EProduit%3C/text%3E%3C/svg%3E"
            img.alt = "Image produit"
          }
        })

        // Nettoyer les classes CSS qui pourraient poser problème
        sectionClone.removeAttribute("class")
        sectionClone.style.pageBreakInside = "avoid"
        
        // Ajouter la section au conteneur
        pdfContainer.appendChild(sectionClone)
      })

      console.log("🎨 Ajout du conteneur au DOM...")
      // Ajouter le conteneur au document temporairement
      document.body.appendChild(pdfContainer)

      // Attendre que le contenu se stabilise
      console.log("⏳ Attente du chargement...")
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log("📸 Capture de la page...")
      // Générer le canvas à partir du conteneur
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // S'assurer que les styles sont appliqués dans le clone
          try {
            const clonedContainer = clonedDoc.querySelector('#pdf-export-container')
            if (clonedContainer) {
              (clonedContainer as HTMLElement).style.position = 'static'
              ;(clonedContainer as HTMLElement).style.left = '0'
            } else {
              // Fallback : chercher le premier div
              const firstDiv = clonedDoc.querySelector('div')
              if (firstDiv) {
                (firstDiv as HTMLElement).style.position = 'static'
                ;(firstDiv as HTMLElement).style.left = '0'
              }
            }
          } catch (error) {
            console.warn("⚠️ Erreur lors de l'application des styles au clone:", error)
          }
        }
      })

      console.log(`📏 Canvas créé: ${canvas.width}x${canvas.height}`)

      // Nettoyer le conteneur temporaire
      document.body.removeChild(pdfContainer)

      console.log("📋 Création du PDF...")
      // Créer le PDF
      const imgData = canvas.toDataURL('image/png', 0.8)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const availableWidth = pdfWidth - (2 * margin)
      const availableHeight = pdfHeight - (2 * margin)
      
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calculer le ratio pour s'adapter à la page
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      
      console.log(`📐 Dimensions PDF: ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}mm`)
      
      // Si le contenu est plus haut qu'une page, on divise en plusieurs pages
      if (scaledHeight > availableHeight) {
        console.log("📄 Contenu multi-pages détecté")
        const pageCount = Math.ceil(scaledHeight / availableHeight)
        const sectionHeight = imgHeight / pageCount
        
        console.log(`📖 Création de ${pageCount} pages`)
        
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage()
          }
          
          const sourceY = i * sectionHeight
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          
          pageCanvas.width = imgWidth
          pageCanvas.height = Math.min(sectionHeight, imgHeight - sourceY)
          
          pageCtx?.drawImage(
            canvas,
            0, sourceY, imgWidth, pageCanvas.height,
            0, 0, imgWidth, pageCanvas.height
          )
          
          const pageImgData = pageCanvas.toDataURL('image/png', 0.8)
          pdf.addImage(pageImgData, 'PNG', margin, margin, availableWidth, (pageCanvas.height * ratio))
          
          console.log(`  ✅ Page ${i + 1}/${pageCount} créée`)
        }
      } else {
        // Le contenu tient sur une page
        console.log("📄 Contenu sur une seule page")
        pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight)
      }

      // Télécharger le PDF
      const filename = `${documentTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`
      console.log(`💾 Téléchargement: ${filename}`)
      pdf.save(filename)
      
      console.log("✅ PDF généré avec succès!")

    } catch (error) {
      console.error("❌ Erreur lors de la génération du PDF:", error)
      alert(
        `Une erreur est survenue lors de la génération du PDF: ${error instanceof Error ? error.message : "Erreur inconnue"}\n\nVérifiez la console pour plus de détails.`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isGenerating} 
      variant="outline" 
      size={size} 
      className={`bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-200 ${className || ''}`}
    >
      <FileDown className={`mr-2 ${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
      <span className={`${size === "sm" ? "text-xs sm:text-sm" : ""} font-semibold`}>
        {isGenerating ? "..." : (size === "sm" ? "PDF" : "Exporter PDF")}
      </span>
    </Button>
  )
}
