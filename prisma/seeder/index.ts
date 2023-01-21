/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import defaultData from "./defaults";
import fakeData from "./fakes";

import { PrismaClient } from "@prisma/client";

import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

const main = async () => {
    const doSeedDatabase = await prompt("Do you want to seed the database? (y/N): ");

    if (doSeedDatabase.toLowerCase() === "y") {
        const confirmDefault = await prompt("Seed the default/predefined data (roles, attachment storage)? (y/N): ");

        if (confirmDefault.toLowerCase() === "y") {
            const confirmDefaultSure = await prompt("Are you sure? (y/N): ");

            if (confirmDefaultSure.toLowerCase() === "y") {
                const { roles, attachment_storage } = await defaultData(prisma);

                console.log("Default data seeded successfully");

                const confirmFake = await prompt("Seed the fake data? (y/N): ");

                if (confirmFake.toLowerCase() === "y") {
                    const confirmFakeSure = await prompt("Are you sure? (y/N): ");

                    if (confirmFakeSure.toLowerCase() === "y") {
                        await fakeData(prisma, roles, attachment_storage);
                        console.log("Fake data seeded successfully");
                    }
                }
            }
        }
    }
};

main()
    .then(async () => {
        await prisma.$disconnect();
        rl.close();
        process.exit(0);
    })
    .catch(async (error) => {
        await prisma.$disconnect();
        rl.close();
        console.error(error);
        process.exit(1);
    });
