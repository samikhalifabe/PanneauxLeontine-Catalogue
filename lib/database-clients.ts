import { createClient } from '@supabase/supabase-js'
import { Pool, QueryResult } from 'pg'
import { getDatabaseConfig } from './database-config'

// Interface commune pour les opérations de base de données
export interface DatabaseClient {
  query(text: string, params?: any[]): Promise<QueryResult>
  select(table: string, options?: SelectOptions): Promise<any[]>
  insert(table: string, data: any): Promise<any>
  update(table: string, data: any, where: any): Promise<any>
  delete(table: string, where: any): Promise<any>
}

export interface SelectOptions {
  columns?: string[]
  where?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }[]
  limit?: number
  offset?: number
}

// Client PostgreSQL pour Neon
class PostgreSQLClient implements DatabaseClient {
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect()
    try {
      return await client.query(text, params)
    } finally {
      client.release()
    }
  }

  async select(table: string, options: SelectOptions = {}): Promise<any[]> {
    const { columns = ['*'], where, orderBy, limit, offset } = options
    
    let query = `SELECT ${columns.join(', ')} FROM ${table}`
    const params: any[] = []
    let paramCount = 0

    // WHERE clause
    if (where && Object.keys(where).length > 0) {
      const whereConditions = Object.entries(where).map(([key, value]) => {
        params.push(value)
        paramCount++
        return `${key} = $${paramCount}`
      })
      query += ` WHERE ${whereConditions.join(' AND ')}`
    }

    // ORDER BY clause
    if (orderBy && orderBy.length > 0) {
      const orderConditions = orderBy.map(({ column, ascending = true }) => 
        `${column} ${ascending ? 'ASC' : 'DESC'}`
      )
      query += ` ORDER BY ${orderConditions.join(', ')}`
    }

    // LIMIT clause
    if (limit) {
      query += ` LIMIT ${limit}`
    }

    // OFFSET clause
    if (offset) {
      query += ` OFFSET ${offset}`
    }

    const result = await this.query(query, params)
    return result.rows
  }

  async insert(table: string, data: any): Promise<any> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `
    
    const result = await this.query(query, values)
    return result.rows[0]
  }

  async update(table: string, data: any, where: any): Promise<any> {
    const updateKeys = Object.keys(data)
    const updateValues = Object.values(data)
    const whereKeys = Object.keys(where)
    const whereValues = Object.values(where)
    
    const updateClause = updateKeys.map((key, i) => `${key} = $${i + 1}`).join(', ')
    const whereClause = whereKeys.map((key, i) => `${key} = $${i + updateKeys.length + 1}`).join(' AND ')
    
    const query = `
      UPDATE ${table} 
      SET ${updateClause} 
      WHERE ${whereClause} 
      RETURNING *
    `
    
    const result = await this.query(query, [...updateValues, ...whereValues])
    return result.rows[0]
  }

  async delete(table: string, where: any): Promise<any> {
    const whereKeys = Object.keys(where)
    const whereValues = Object.values(where)
    const whereClause = whereKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')
    
    const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`
    
    const result = await this.query(query, whereValues)
    return result.rows
  }
}

// Adaptateur Supabase qui implémente notre interface
class SupabaseClient implements DatabaseClient {
  private client: any

  constructor(url: string, key: string) {
    this.client = createClient(url, key)
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    // Pour les requêtes SQL brutes avec Supabase
    const { data, error } = await this.client.rpc('execute_sql', { 
      sql: text, 
      params: params || [] 
    })
    
    if (error) throw new Error(error.message)
    
    return { rows: data } as QueryResult
  }

  async select(table: string, options: SelectOptions = {}): Promise<any[]> {
    const { columns, where, orderBy, limit, offset } = options
    
    let query = this.client.from(table)
    
    if (columns && columns.length > 0 && !columns.includes('*')) {
      query = query.select(columns.join(', '))
    } else {
      query = query.select('*')
    }
    
    // WHERE conditions
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    // ORDER BY
    if (orderBy && orderBy.length > 0) {
      orderBy.forEach(({ column, ascending = true }) => {
        query = query.order(column, { ascending })
      })
    }
    
    // LIMIT
    if (limit) {
      query = query.limit(limit)
    }
    
    // OFFSET
    if (offset) {
      query = query.range(offset, offset + (limit || 1000) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw new Error(error.message)
    return data || []
  }

  async insert(table: string, data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return result
  }

  async update(table: string, data: any, where: any): Promise<any> {
    let query = this.client.from(table).update(data)
    
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data: result, error } = await query.select().single()
    
    if (error) throw new Error(error.message)
    return result
  }

  async delete(table: string, where: any): Promise<any> {
    let query = this.client.from(table)
    
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query.delete().select()
    
    if (error) throw new Error(error.message)
    return data
  }
}

// Factory pour créer le bon client selon la configuration
let sharedClient: DatabaseClient | null = null

export async function getDatabaseClient(): Promise<DatabaseClient> {
  if (sharedClient) {
    return sharedClient
  }

  const config = getDatabaseConfig()
  
  if (config.provider === 'neon') {
    console.log('✓ Connexion à Neon PostgreSQL')
    sharedClient = new PostgreSQLClient(config.connectionString!)
  } else {
    console.log('✓ Connexion à Supabase')
    sharedClient = new SupabaseClient(config.supabase!.url, config.supabase!.key)
  }

  return sharedClient
}

// Fonction pour reset le client (utile pour les tests ou changement de config)
export function resetDatabaseClient() {
  sharedClient = null
} 