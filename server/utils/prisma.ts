import { PrismaClient } from '@prisma/client'
import { isDevelopment } from 'std-env'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma
  = globalForPrisma.prisma || new PrismaClient()

if (isDevelopment)
  globalForPrisma.prisma = prisma
