import { PrismaClient } from '@prisma/client';

// Create Prisma Client with connection handling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// For Node.js global
const globalForPrisma = globalThis;

// Use existing instance or create new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, store in global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log connection status
console.log('🔌 Prisma Client initialized');

export default prisma;
