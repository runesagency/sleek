import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient();
const parsedDatabaseUrl = new URL(process.env.DATABASE_URL);
const databaseSchema = parsedDatabaseUrl.searchParams.get("schema");

const main = async () => {
    if (!databaseSchema || databaseSchema !== "dev") {
        throw new Error("Database reset is only allowed in development (dev) schema");
    }

    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname=${databaseSchema}`;

    if (tablenames.length === 0) {
        console.log("🍃 No tables found in database");
        return;
    }

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== "_prisma_migrations")
        .map((name) => `"${databaseSchema}"."${name}"`)
        .join(", ");

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        console.log("✅ Database reset successful");
    } catch (error) {
        console.log({ error });
    }
};

main()
    .then(async () => {
        await prisma.$disconnect();
        process.exit(0);
    })
    .catch(async (error) => {
        await prisma.$disconnect();
        console.error(error);
        process.exit(1);
    });
