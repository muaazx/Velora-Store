import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } else {
    console.warn('⚠️ DATABASE_URL environment variable is missing. Prisma Client will not connect.');
  }
} catch (err) {
  console.error('❌ Failed to initialize Prisma Client:', err);
}

export { prisma };
