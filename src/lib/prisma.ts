import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const parsedDatabaseUrl = new URL(process.env.DATABASE_URL);
const databaseSchema = parsedDatabaseUrl.searchParams.get("schema");

if ((!databaseSchema || databaseSchema !== "dev") && process.env.NODE_ENV !== "production") {
    throw new Error("Please only use the development (dev) schema on the database on development mode");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
