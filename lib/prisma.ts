import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'], // Removes 'query' logs but keeps important logs
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
