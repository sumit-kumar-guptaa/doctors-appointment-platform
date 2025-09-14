import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Test the connection
db.$connect().catch((error) => {
  console.error("Failed to connect to database:", error);
});
