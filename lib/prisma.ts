import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Prisma 7 requires an adapter for SQLite
  // libsql client needs absolute file path with file:/// (triple slash)
  const databaseUrl = (process.env.DATABASE_URL || 'file:./dev.db').replace(/[?&]channel_binding=[^&]+/, '')

  // Convert to absolute file:/// URL for libsql
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

  // Debug: log the URL being used
  if (process.env.NODE_ENV === 'development') {
    console.log('[Prisma] Configured URL:', absoluteDbUrl)
  }

  const libsql = createClient({ url: absoluteDbUrl })
  const adapter = new PrismaLibSql(libsql as any)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
