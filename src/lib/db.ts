// Note: Removed 'use server' directive as we're exporting an object, not just async functions
import { PrismaClient } from '../generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit due to instantiating too many clients
// during hot reloading

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a connection function to handle potential errors
function createPrismaClient() {
  try {
    return new PrismaClient({
      // Add logging in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    // Return a mock client that logs errors instead of crashing
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add a proxy to handle missing methods
      $on: () => {},
      ...new Proxy({}, {
        get: (_, prop) => {
          if (typeof prop === 'string' && !['then', 'catch'].includes(prop)) {
            console.error(`Attempted to access Prisma client method "${String(prop)}" but client failed to initialize.`);
          }
          return () => Promise.reject(new Error('Prisma client not initialized'));
        }
      })
    } as unknown as PrismaClient;
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
