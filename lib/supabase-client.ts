// Client Supabase partagé pour éviter les instances multiples
let supabaseClient: any = null

export async function getSharedSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const { createClient } = await import("@supabase/supabase-js")

  // Récupérer les variables d'environnement
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  // Vérifier le format de l'URL
  if (!supabaseUrl.startsWith('http')) {
    throw new Error(`URL Supabase invalide: ${supabaseUrl}`)
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey)
  console.log("✓ Client Supabase initialisé")
  
  return supabaseClient
} 