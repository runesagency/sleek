/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { DefaultConfigurations, DefaultRoles } from "./defaults";

import defaultData from "./defaults";
import fakeData from "./fakes";

import { PrismaClient } from "@prisma/client";

import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

const seedDefaultData = async () => {
    const confirm = await prompt("❓ Seed the default/predefined data (roles, configurations)? (y/N): ");

    if (confirm.toLowerCase() === "y") {
        const sure = await prompt('⛔ Make sure you haven\'t seeded the data before. If you are sure, type "there is no DEFAULT data before"\n: ');

        if (sure.toLowerCase() === "there is no default data before") {
            const { roles, configurations } = await defaultData(prisma);
            console.log("Default data seeded successfully 🤘");

            await seedFakeData(roles, configurations);
        } else {
            console.log("It seems that you have seeded the data before, or have a typo in your answer. 😅");
            console.log("Damn, aborting default data seeding...");
        }
    }
};

const seedFakeData = async (roles: DefaultRoles, configurations: DefaultConfigurations) => {
    const confirm = await prompt("❓ Seed the fake data? (y/N): ");

    if (confirm.toLowerCase() === "y") {
        const sure = await prompt('⛔ This action should only be done in development environment. If you are sure, type "i want to insert FAKE data"\n: ');

        if (sure.toLowerCase() === "i want to insert fake data") {
            await fakeData(prisma, roles, configurations);
            console.log("You have reached the end of the story, now go and build something awesome! 🚀");
        } else {
            console.log("I think you are changing your mind, or maybe a typo? 😅");
            console.log("Alright, have a nice day!");
        }
    }
};

seedDefaultData()
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
