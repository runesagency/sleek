import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.users.create({
        data: {
            name: "Alice",
            email: "alice@wonderland.id",
            password: "alice123",
        },
    });

    const project = await prisma.projects.create({
        data: {
            name: "Project 1",
            users_joined: {
                create: {
                    user_id: user.id,
                },
            },
        },
    });

    const board = await prisma.boards.create({
        data: {
            name: "Board 1",
            project_id: project.id,
        },
    });

    const list = await prisma.lists.create({
        data: {
            title: "To Do",
            board_id: board.id,
        },
    });

    await prisma.cards.create({
        data: {
            title: "Card 1",
            board_id: board.id,
            list_id: list.id,
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
