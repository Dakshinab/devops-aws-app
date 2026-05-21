import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:StayDB2026!@serene-stay-db.c3me0aw0uxob.ap-south-1.rds.amazonaws.com:5432/devops_aws?sslmode=no-verify";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  max: 10,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}