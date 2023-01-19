import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

    // ------------------------------------------------------------

    const permission_administrator = await prisma.permissions.create({
        data: {
            name: "ADMINISTRATOR",
            description: "Administrator",
        },
    });

    const permission_create_project = await prisma.permissions.create({
        data: {
            name: "CREATE_PROJECT",
            description: "Create a project in an organization",
        },
    });

    const permission_create_board = await prisma.permissions.create({
        data: {
            name: "CREATE_BOARD",
            description: "Create a board in a project",
        },
    });

    // ------------------------------------------------------------

    const user = await prisma.users.create({
        data: {
            name: "Alice",
            email: "alice@wonderland.id",
            password: "alice123",
            permissions: {
                create: {
                    permission_id: permission_administrator.id,
                },
            },
        },
    });

    const organization = await prisma.organizations.create({
        data: {
            name: "Wonderland Inc.",
            description: "A company that sells comic books based on Jekardah",
            creator_id: user.id,
        },
    });
    const transactions: PrismaPromise<any>[] = [];
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

    await prisma.organization_users.create({
        data: {
            organization_id: organization.id,
            user_id: user.id,
            permissions: {
                create: {
                    permission_id: permission_create_project.id,
                },
            },
        },
    });
    const tablenames = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'tests';`;

    // ------------------------------------------------------------

    const project = await prisma.projects.create({
        data: {
            name: "DWP Festive 2069",
            description: "Rundown and preparation for the festive",
            users_joined: {
                create: {
                    user_id: user.id,
                    permissions: {
                        create: {
                            permission_id: permission_administrator.id,
                        },
                    },
                },
            },
            organizations_joined: {
                create: {
                    organization_id: organization.id,
                    permissions: {
                        create: {
                            permission_id: permission_create_board.id,
                        },
                    },
                },
            },
        },
    });

    // ------------------------------------------------------------
    for (const { TABLE_NAME } of tablenames) {
        if (TABLE_NAME !== "_prisma_migrations") {
            try {
                transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`));
            } catch (error) {
                console.log({ error });
            }
        }
    }

    const board = await prisma.boards.create({
        data: {
            name: "Investor Funding",
            description: "A followup and step-by-step to raise funding for the festive",
            project_id: project.id,
        },
    });
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

    console.log(board.id);
    try {
        await prisma.$transaction(transactions);
    } catch (error) {
        console.log({ error });
    }

    const list_todo = await prisma.lists.create({
        data: {
            title: "To Do",
            board_id: board.id,
            order: 0,
        },
    });

    const list_ongoing = await prisma.lists.create({
        data: {
            title: "On Going",
            board_id: board.id,
            order: 1,
        },
    });

    await prisma.cards.create({
        data: {
            title: "Create ideas",
            board_id: board.id,
            list_id: list_todo.id,
            order: 0,
            checklists: {
                create: {
                    checklist: {
                        create: {
                            title: "Create ideas",
                            tasks: {
                                create: {
                                    text: "find happiness",
                                    completed: false,
                                    due_date: new Date("2021-12-25"),
                                    users: {
                                        create: {
                                            user_id: user.id,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            labels: {
                create: {
                    label: {
                        create: {
                            name: "( ͡° ͜ʖ ͡°)",
                        },
                    },
                },
            },
            timers: {
                createMany: {
                    data: [
                        {
                            started_at: new Date("2021-12-25"),
                            ended_at: new Date("2021-12-26"),
                        },
                        {
                            started_at: new Date("2021-12-26"),
                        },
                    ],
                },
            },
            users: {
                create: {
                    user_id: user.id,
                    subscribed: true,
                },
            },
        },
    });

    await prisma.cards.create({
        data: {
            title: "Collect reliable investors data",
            board_id: board.id,
            list_id: list_todo.id,
            order: 1,
        },
    });

    await prisma.cards.create({
        data: {
            title: "Create poster",
            board_id: board.id,
            list_id: list_ongoing.id,
            order: 0,
        },
    });

    await prisma.cards.create({
        data: {
            title: "Do something",
            board_id: board.id,
            list_id: list_ongoing.id,
            order: 1,
        },
    });

    await prisma.cards.create({
        data: {
            title: "TURU",
            board_id: board.id,
            list_id: list_ongoing.id,
            order: 2,
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
