import { PrismaClient } from '@prisma/client'
import { PrismaLibsql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL || ''

const isPostgres = databaseUrl.startsWith('postgresql:') || databaseUrl.startsWith('postgres:')
const isLibsql = databaseUrl.startsWith('libsql:') || databaseUrl.startsWith('wss:') || databaseUrl.startsWith('ws:') || databaseUrl.startsWith('https:') || databaseUrl.startsWith('http:')

let adapter: any

if (isPostgres) {
  const pool = new Pool({ connectionString: databaseUrl })
  adapter = new PrismaNeon(pool)
} else {
  const _client = isLibsql 
    ? createClient({
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      })
    : createClient({
        url: 'file:dev.db',
      })
  adapter = new PrismaLibsql(_client)
}

export const prisma = new PrismaClient({ adapter })
