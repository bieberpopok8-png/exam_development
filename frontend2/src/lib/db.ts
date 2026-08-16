import { PrismaClient } from '@prisma/client'

// Versioned cache key. Bump the version whenever the Prisma schema changes
// destructively, so a long-running dev server creates a fresh client that
// knows about the new models/fields (and reconnects to a recreated DB file).
const PRISMA_CACHE_VERSION = 'v4-extract'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaVersion?: string
}

export const db =
  (globalForPrisma.prismaVersion === PRISMA_CACHE_VERSION && globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: ['error', 'warn'],
      })

globalForPrisma.prisma = db
globalForPrisma.prismaVersion = PRISMA_CACHE_VERSION
