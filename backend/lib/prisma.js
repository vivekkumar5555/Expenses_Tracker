import { PrismaClient } from '@prisma/client';

// Create Prisma Client with proper configuration
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  
  // Handle connection errors gracefully
  // Note: $on is for query events, errors are caught in try-catch
  
  return client;
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
