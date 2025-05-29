"use client"

import Image from "next/image"

export default function DebugImagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Images - Test Simple</h1>
      
      <div className="space-y-8">
        {/* Test 1: Placeholder API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">1. Test API Placeholder</h2>
          <div className="w-32 h-32 border-2 border-gray-300">
            <Image
              src="/api/placeholder?text=Test&width=128&height=128"
              alt="Test placeholder"
              width={128}
              height={128}
              className="rounded"
            />
          </div>
        </div>

        {/* Test 2: Image qui va échouer */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">2. Test Image qui échoue (403)</h2>
          <div className="w-32 h-32 border-2 border-gray-300">
            <Image
              src="https://shop.panneauxleontine.be/808-medium_default/bac-rectangulaire-en-acier-corten-200-x-40-x-80-cm.jpg"
              alt="Test 403"
              width={128}
              height={128}
              className="rounded"
              onError={(e) => {
                console.log("Erreur image:", e)
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-red-100 flex items-center justify-center text-red-600 text-sm">Erreur 403</div>'
                }
              }}
            />
          </div>
        </div>

        {/* Test 3: SafeImage simple */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">3. Test SafeImage basique</h2>
          <div className="w-32 h-32 border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl">📦</div>
              <div className="text-xs text-gray-600 mt-2">SafeImage Test</div>
            </div>
          </div>
        </div>

        {/* Test 4: Image standard qui marche */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">4. Test image locale (si elle existe)</h2>
          <div className="w-32 h-32 border-2 border-gray-300">
            <Image
              src="/logo_kleur_2021.png"
              alt="Logo"
              width={128}
              height={128}
              className="rounded object-contain"
              onError={(e) => {
                console.log("Logo non trouvé")
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-sm">Logo non trouvé</div>'
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 