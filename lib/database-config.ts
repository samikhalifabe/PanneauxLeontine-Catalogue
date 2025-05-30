export type DatabaseProvider = 'supabase' | 'neon'

export interface DatabaseConfig {
  provider: DatabaseProvider
  connectionString?: string
  supabase?: {
    url: string
    key: string
  }
}

export function getDatabaseConfig(): DatabaseConfig {
  const provider = (process.env.DATABASE_PROVIDER || 'supabase') as DatabaseProvider
  
  if (provider === 'neon') {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL est requis pour Neon')
    }
    return {
      provider: 'neon',
      connectionString
    }
  }
  
  // Configuration Supabase par défaut
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SUPABASE_ANON_KEY || 
                     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variables d\'environnement Supabase manquantes')
  }

  return {
    provider: 'supabase',
    supabase: {
      url: supabaseUrl,
      key: supabaseKey
    }
  }
} 