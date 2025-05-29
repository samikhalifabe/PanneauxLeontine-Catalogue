import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || 'Image'
  const width = parseInt(searchParams.get('width') || '300')
  const height = parseInt(searchParams.get('height') || '300')
  const bgColor = searchParams.get('bg') || '#f8f9fa'
  const textColor = searchParams.get('color') || '#6b7280'

  // Limiter la longueur du texte pour éviter les débordements
  const displayText = text.length > 20 ? text.substring(0, 20) + '...' : text
  
  // Calculer la taille de police en fonction de la taille de l'image
  const fontSize = Math.max(12, Math.min(width / 15, height / 15))
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <g transform="translate(${width/2}, ${height/2})">
        <!-- Icône de package -->
        <rect x="-20" y="-25" width="40" height="35" rx="4" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.6"/>
        <rect x="-15" y="-30" width="30" height="10" rx="2" fill="${textColor}" opacity="0.4"/>
        <line x1="-10" y1="-20" x2="10" y2="-20" stroke="${textColor}" stroke-width="1" opacity="0.6"/>
        <line x1="-10" y1="-10" x2="10" y2="-10" stroke="${textColor}" stroke-width="1" opacity="0.6"/>
        
        <!-- Texte principal -->
        <text x="0" y="20" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" 
              font-weight="500" fill="${textColor}" text-anchor="middle" opacity="0.8">
          ${displayText}
        </text>
        
        <!-- Sous-texte -->
        <text x="0" y="35" font-family="Inter, Arial, sans-serif" font-size="${Math.max(10, fontSize - 2)}" 
              fill="${textColor}" text-anchor="middle" opacity="0.6">
          Image non disponible
        </text>
      </g>
    </svg>
  `

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400' // Cache pour 24h
    }
  })
} 