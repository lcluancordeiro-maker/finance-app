import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SQLite relative paths in DATABASE_URL resolve differently for the Prisma CLI
// (relative to prisma/schema.prisma) vs. the runtime client (relative to process.cwd()).
// Pin the runtime connection to an absolute path so it's correct regardless of cwd.
const dbPath = path.join(process.cwd(), "prisma", "dev.db");

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: `file:${dbPath}` });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
