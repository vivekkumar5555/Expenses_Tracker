import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance
let prisma;

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// In production, always create a new instance
// In development, use global to prevent multiple instances during hot reload
if (isProduction) {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // Use globalThis for Node.js compatibility
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalThis.__prisma;
}

// Export the prisma client
export default prisma;
