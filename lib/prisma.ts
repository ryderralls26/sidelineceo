import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = (process.env.DATABASE_URL || 'file:./dev.db').replace(/[?&]channel_binding=[^&]+/, '')
  
  const isPostgres = databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:')
  
  let adapter: any

  if (isPostgres) {
    const pool = new Pool({ connectionString: databaseUrl })
    adapter = new PrismaNeon(pool as any)
  } else {
    // Convert to absolute file:/// URL for libsql if using file
    let absoluteDbUrl: string
    if (databaseUrl.startsWith('file:')) {
      const relativePath = databaseUrl.replace('file:', '')
      const absolutePath = relativePath.startsWith('/')
        ? relativePath
        : `${process.cwd()}/${relativePath.replace('./', '')}`
      absoluteDbUrl = `file:///${absolutePath.replace(/^\/+/, '')}`
    } else {
      absoluteDbUrl = databaseUrl
    }
    
    const libsql = createClient({ url: absoluteDbUrl })
    adapter = new PrismaLibSql(libsql as any)
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma