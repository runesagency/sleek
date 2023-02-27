/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import getDefaultData from "./defaults";
import getFakeData from "./fakes";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
    console.log("🌱 Seeding default data...");
    await getDefaultData(prisma);

    if (process.argv.includes("--with-fake-data")) {
        console.log("⚠ Detected --with-fake-data flag");
        console.log("🎭 Generating fake data...");
        await getFakeData(prisma);
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
