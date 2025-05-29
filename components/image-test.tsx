"use client"

import { SafeImage } from "./safe-image"

export function ImageTest() {
  const testImages = [
    {
      name: "API Placeholder (local)",
      src: "/api/placeholder?text=TestLocal&width=150&height=150",
      productName: "Test API Placeholder"
    },
    {
      name: "Image externe 403",
      src: "https://shop.panneauxleontine.be/808-medium_default/bac-rectangulaire-en-acier-corten-200-x-40-x-80-cm.jpg",
      productName: "Bac rectangulaire en acier corten"
    },
    {
      name: "Image vide",
      src: "",
      productName: "Produit sans image"
    },
    {
      name: "Image 404",
      src: "https://example.com/image-inexistante.jpg",
      productName: "Image inexistante"
    },
    {
      name: "URL invalide",
      src: "not-a-valid-url",
      productName: "URL malformée"
    },
    {
      name: "Domaine non autorisé",
      src: "https://google.com/logo.png",
      productName: "Domaine Google non autorisé"
    }
  ]

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Test SafeImage - Version Corrigée</h2>
      
      {/* Status de l'API */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">🔧 Tests de diagnostic</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>API Placeholder disponible à: <code className="bg-blue-100 px-1 rounded">/api/placeholder</code></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>SafeImage avec gestion d'erreurs automatique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>Tests pour URLs 403, 404, invalides et domaines non autorisés</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((image, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                image.src === "" ? "bg-gray-400" :
                image.src.includes("403") || image.src.includes("shop.panneaux") ? "bg-red-400" :
                image.src.includes("404") || image.src.includes("inexistante") ? "bg-orange-400" :
                image.src.includes("google") ? "bg-purple-400" :
                image.src.includes("not-a-valid") ? "bg-yellow-400" :
                "bg-green-400"
              }`}></div>
              <h3 className="font-semibold text-sm">{image.name}</h3>
            </div>
            
            <div className="w-full h-32 mb-3 border-2 border-dashed border-gray-200 rounded overflow-hidden">
              <SafeImage
                src={image.src}
                alt={image.productName}
                width={200}
                height={128}
                productName={image.productName}
                className="w-full h-full"
                onError={() => console.log(`Test error for: ${image.name}`)}
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">{image.productName}</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-1 rounded">
                {image.src || "Pas d'URL"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`text-xs px-2 py-1 rounded ${
                  image.src === "" ? "bg-gray-100 text-gray-600" :
                  image.src.includes("api/placeholder") ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {image.src === "" ? "Vide" :
                   image.src.includes("api/placeholder") ? "API OK" :
                   "Erreur attendue"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section d'informations techniques */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-4">📋 Résumé des corrections appliquées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">🛠️ Améliorations techniques</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Reset automatique des états lors du changement d'URL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Validation robuste des URLs avec domaines autorisés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Gestion des dimensions par défaut (300x300)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Logs de debug pour traçage des erreurs</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">🎨 Améliorations UX</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">✓</span>
                <span>Placeholders élégants avec nom du produit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">✓</span>
                <span>Animations de chargement fluides</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">✓</span>
                <span>Messages d'erreur informatifs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">✓</span>
                <span>Responsive et compatible impression</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 