// Note: Removed 'use server' directive as we're exporting an object, not just async functions
import { PrismaClient } from '../generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit due to instantiating too many clients
// during hot reloading

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
