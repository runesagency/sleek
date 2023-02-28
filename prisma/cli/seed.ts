/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import generateFakeData from "../utils/generate-fake-data";
import getDefaultData from "../utils/get-default-data";

import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient();
const parsedDatabaseUrl = new URL(process.env.DATABASE_URL);
const databaseSchema = parsedDatabaseUrl.searchParams.get("schema");

const main = async () => {
    console.log("🌱 Seeding default data...");
    await getDefaultData(prisma);
    console.log("✅ Default data seeded");

    if (process.argv.includes("--with-fake-data")) {
        console.log("⚠ Detected `--with-fake-data` flag");

        if (!databaseSchema || databaseSchema !== "dev") {
            throw new Error("Database seeding only available on development (dev) schema");
        }

        console.log("🎭 Generating fake data...");
        await generateFakeData(prisma);
        console.log("✅ Fake data generated");
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
