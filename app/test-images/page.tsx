import { ImageTest } from "@/components/image-test"

export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Test des Images SafeImage</h1>
        <ImageTest />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Résumé des corrections</h2>
          <div className="bg-white rounded-lg p-6 shadow">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>SafeImage</strong> : Composant qui gère automatiquement les erreurs d'images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>API Placeholder</strong> : Génération de placeholders SVG dynamiques (/api/placeholder)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Fallbacks élégants</strong> : Interface gracieuse même avec images 403/404</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Performance</strong> : Chargement optimisé avec états de loading</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 