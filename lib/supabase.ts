import { createClient } from "@supabase/supabase-js"

// Création du client Supabase côté serveur avec gestion d'erreur améliorée
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL est requis. Vérifiez vos variables d'environnement.")
  }

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY est requis. Vérifiez vos variables d'environnement.",
    )
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Création du client Supabase côté client (singleton pattern)
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis pour le client Supabase côté client.",
    )
  }

  clientSupabaseClient = createClient(supabaseUrl, supabaseKey)

  return clientSupabaseClient
}
