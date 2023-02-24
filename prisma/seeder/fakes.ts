/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { DefaultConfigurations, DefaultRoles } from "./defaults";
import type { Board, List, Organization, PrismaClient, Project, User } from "@prisma/client";

import { faker } from "@faker-js/faker";

const fakeOrganizations = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: User) => {
    const length = faker.datatype.number({ min: 0, max: 2 });
    if (length === 0) return;

    console.log(`> 🤔 It seems that ${user.name} is planning to create ${length} organizations...`);

    let index = 0;

    while (index < length) {
        // List of users in the organization that can create projects
        let members: User[] = [user];

        // Create the organization
        const organization = await prisma.organization.create({
            data: {
                name: faker.company.name(),
                description: faker.company.catchPhrase(),
                ownerId: user.id,
                creatorId: user.id,
            },
        });

        console.log(`> 🛡 He/She then creating an organization named ${organization.name}...`);

        // Add users to the organization
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 He/She also thinking about adding another user to the organization...`);

            const anotherUsers = await prisma.user.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.organization.ADMIN, roles.organization.MANAGER, roles.organization.MEMBER]);

                await prisma.organizationUser.create({
                    data: {
                        userId: invitedUser.id,
                        organizationId: organization.id,
                        roleId: roleGiven.id,
                        adderId: user.id,
                    },
                });

                if (roleGiven.id !== roles.organization.MEMBER.id) {
                    members.push(invitedUser);
                }

                console.log(`*User ${invitedUser.name} is added to the organization by ${invitedUser.name} users and given the role ${roleGiven.name}*`);
            }
        }

        // Done, now create projects
        for (const user of members) {
            await fakeProjects(prisma, roles, configurations, user, organization);
        }

        index++;
    }
};

const fakeProjects = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: User, organization: Organization) => {
    const length = faker.datatype.number({ min: 0, max: 2 });
    if (length === 0) return;

    console.log(`> 🤑 Since become an entrepreneur, ${user.name} has been thinking to create ${length} projects...`);

    let index = 0;

    while (index < length) {
        // List of users in the project that can create boards
        let members: User[] = [user];

        // Create the project
        const project = await prisma.project.create({
            data: {
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                password: faker.datatype.boolean() ? faker.internet.password() : null,
                startDate: faker.datatype.boolean() ? faker.date.past() : null,
                dueDate: faker.datatype.boolean() ? faker.date.future() : null,
                organizationId: organization.id,
                creatorId: user.id,
            },
        });

        await prisma.projectUser.create({
            data: {
                userId: user.id,
                projectId: project.id,
                roleId: roles.project.ADMIN.id,
                adderId: user.id,
            },
        });

        console.log(`> 🧪 He/She then initiate project named ${project.name}...`);

        // Add users to the project
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 He/She wants another user to the project...`);

            const anotherUsers = await prisma.user.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                await prisma.projectUser.create({
                    data: {
                        userId: invitedUser.id,
                        projectId: project.id,
                        roleId: roleGiven.id,
                        adderId: user.id,
                    },
                });

                if (roleGiven.id !== roles.project.MEMBER.id) {
                    members.push(invitedUser);
                }

                console.log(`*User ${invitedUser.name} is joining ${user.name} project and given the role ${roleGiven.name}*`);
            }
        }

        // Add organizations to the project
        const addOrganization = faker.datatype.boolean();

        if (addOrganization) {
            console.log(`> 🤝 Because he/she is a rich person, he/she then contacting another organization to the project...`);

            const anotherOrganizations = await prisma.organization.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: organization.id,
                    },
                },
            });

            for (const invitedOrganization of anotherOrganizations) {
                const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                await prisma.projectOrganization.create({
                    data: {
                        organizationId: invitedOrganization.id,
                        projectId: project.id,
                        roleId: roleGiven.id,
                        adderId: user.id,
                    },
                });

                if (roleGiven.id !== roles.project.MEMBER.id) {
                    members.push(user);
                }

                console.log(`*Organization ${invitedOrganization.name} is joining ${user.name} project and given the role ${roleGiven.name}*`);
            }
        }

        // Done, now create boards
        for (const user of members) {
            await fakeBoards(prisma, roles, configurations, user, project);
        }

        index++;
    }
};

const fakeBoards = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: User, project: Project) => {
    const length = faker.datatype.number({ min: 0, max: 5 });
    if (length === 0) return;

    console.log(`> In order to make ${project.name} project successful, ${user.name} then create ${length} boards for the project...`);

    let index = 0;

    while (index < length) {
        // List of users in the board that can create lists and cards
        let members: User[] = [user];

        // Create the board
        const board = await prisma.board.create({
            data: {
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                locked: faker.datatype.boolean(),
                password: faker.datatype.boolean() ? faker.internet.password() : null,
                projectId: project.id,
                creatorId: user.id,
            },
        });

        await prisma.boardUser.create({
            data: {
                userId: user.id,
                boardId: board.id,
                roleId: roles.board.ADMIN.id,
                adderId: user.id,
            },
        });

        console.log(`> 📟 And by that, ${board.name} board is created...`);

        // Add users to the board
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 ${user.name} wants another user to the board...`);

            const anotherUsers = await prisma.user.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                await prisma.boardUser.create({
                    data: {
                        userId: invitedUser.id,
                        boardId: board.id,
                        roleId: roleGiven.id,
                        adderId: user.id,
                    },
                });

                if (roleGiven.id !== roles.board.GUEST.id) {
                    members.push(invitedUser);
                }

                console.log(`*User ${invitedUser.name} is joining ${user.name} board and given the role ${roleGiven.name}*`);
            }
        }

        // Add organizations to the board
        const addOrganization = faker.datatype.boolean();

        if (addOrganization) {
            console.log(`> 🤝 ${user.name} wants another organization to the board...`);

            const anotherOrganizations = await prisma.organization.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: project.organizationId,
                    },
                },
            });

            for (const invitedOrganization of anotherOrganizations) {
                const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                await prisma.boardOrganization.create({
                    data: {
                        organizationId: invitedOrganization.id,
                        boardId: board.id,
                        roleId: roleGiven.id,
                        adderId: user.id,
                    },
                });

                if (roleGiven.id !== roles.board.GUEST.id) {
                    members.push(user);
                }

                console.log(`*Organization ${invitedOrganization.name} is joining ${user.name} board and given the role ${roleGiven.name}*`);
            }
        }

        // Done, now create lists
        for (const user of members) {
            await fakeLists(prisma, configurations, user, board);
        }

        index++;
    }
};

const fakeLists = async (prisma: PrismaClient, configurations: DefaultConfigurations, user: User, board: Board) => {
    const length = faker.datatype.number({ min: 1, max: 5 });

    console.log(`> To make ${board.name} successful, ${user.name} then create ${length} lists (steps) for the board...`);

    let index = 0;

    while (index < length) {
        const list = await prisma.list.create({
            data: {
                title: faker.random.word(),
                description: faker.commerce.productDescription(),
                order: index,
                locked: faker.datatype.boolean(),
                boardId: board.id,
                creatorId: user.id,
            },
        });

        console.log(`List: *${index + 1}. ${list.title}*`);

        await fakeCards(prisma, configurations, user, board, list);

        index++;
    }
};

const fakeCards = async (prisma: PrismaClient, configurations: DefaultConfigurations, user: User, board: Board, list: List) => {
    const length = faker.datatype.number({ min: 0, max: 6 });
    if (length === 0) return;

    console.log(`> ${user.name} then create ${length} cards (tasks) for the list ${list.title}...`);

    let index = 0;

    while (index < length) {
        const card = await prisma.card.create({
            data: {
                title: faker.commerce.productName(),
                description: faker.lorem.paragraphs(),
                listId: list.id,
                boardId: board.id,
                creatorId: user.id,
                order: index,
            },
        });

        console.log(`Card: *${index + 1}. ${card.title}*`);

        const availableBoardMembers = await prisma.user.findMany({
            where: {
                boards: {
                    some: {
                        boardId: board.id,
                    },
                },
            },
        });

        // Add labels to the card
        const addLabel = faker.datatype.boolean();

        if (addLabel) {
            const availableLabels = await prisma.label.findMany({
                where: {
                    OR: {
                        cards: {
                            some: {
                                card: {
                                    boardId: board.id,
                                },
                            },
                        },
                        creatorId: user.id,
                    },
                },
            });

            if (availableLabels.length > 0) {
                const labels = faker.helpers.arrayElements(availableLabels);

                await prisma.cardLabel.createMany({
                    data: labels.map((label) => ({
                        labelId: label.id,
                        adderId: user.id,
                        cardId: card.id,
                    })),
                });

                console.log(`> ${user.name} then add a multiple label to the card ${card.title}...`);
            } else {
                const newLabelCount = faker.datatype.number({ min: 1, max: 5 });
                let newLabelIndex = 0;

                while (newLabelIndex < newLabelCount) {
                    const label = await prisma.label.create({
                        data: {
                            name: faker.random.word(),
                            description: faker.commerce.productDescription(),
                            color: faker.color.rgb({ format: "hex" }),
                            creatorId: user.id,
                            cards: {
                                create: {
                                    cardId: card.id,
                                },
                            },
                        },
                    });

                    console.log(`> ${user.name} then create a label ${label.name} and add it to the card ${card.title}...`);
                    newLabelIndex++;
                }
            }
        }

        // Add members to the card
        const addMember = faker.datatype.boolean();

        if (addMember && availableBoardMembers.length > 0) {
            const members = faker.helpers.arrayElements(availableBoardMembers);

            await prisma.cardUser.createMany({
                data: members.map((member) => ({
                    cardId: card.id,
                    adderId: user.id,
                    subscribed: faker.datatype.boolean(),
                    userId: member.id,
                })),
            });

            console.log(`> ${user.name} then add a multiple member to the card ${card.title}...`);
        }

        // Add timer to the card
        const addTimer = faker.datatype.boolean();

        if (addTimer) {
            const isEnded = faker.datatype.boolean();
            await prisma.cardTimer.create({
                data: {
                    cardId: card.id,
                    description: faker.commerce.productDescription(),
                    startedAt: faker.date.recent(2),
                    starterId: user.id,
                    endedAt: isEnded ? faker.date.recent(1) : null,
                    enderId: isEnded ? user.id : null,
                },
            });

            console.log(`> ${user.name} then add a timer to the card ${card.title}...`);
        }

        // Add checklist to the card
        const addChecklist = faker.datatype.boolean();

        if (addChecklist) {
            const checklistTotal = faker.datatype.number({ min: 0, max: 5 });
            let checklistIndex = 0;

            while (checklistIndex < checklistTotal) {
                const checklist = await prisma.cardChecklist.create({
                    data: {
                        title: faker.commerce.productName(),
                        cardId: card.id,
                        creatorId: user.id,
                    },
                });

                console.log(`> ${user.name} then add a checklist ${checklist.title} to the card ${card.title}...`);

                const taskTotal = faker.datatype.number({ min: 0, max: 5 });
                let taskIndex = 0;

                while (taskIndex < taskTotal) {
                    const checklistItem = await prisma.cardChecklistTask.create({
                        data: {
                            title: faker.commerce.productName(),
                            checklistId: checklist.id,
                            order: taskIndex,
                            completed: faker.datatype.boolean(),
                            creatorId: user.id,
                        },
                    });

                    console.log(`> ${user.name} then add a checklist item ${checklistItem.title} to the checklist ${checklist.title}...`);

                    const addMember = faker.datatype.boolean();

                    if (addMember && availableBoardMembers.length > 0) {
                        const member = faker.helpers.arrayElements(availableBoardMembers);

                        await prisma.cardChecklistTaskUser.createMany({
                            data: member.map((user) => ({
                                taskId: checklistItem.id,
                                adderId: user.id,
                                userId: user.id,
                            })),
                        });

                        console.log(`> ${user.name} then add a multiple member to the checklist item ${checklistItem.title}...`);
                    }

                    taskIndex++;
                }

                checklistIndex++;
            }
        }

        index++;
    }
};

export default async function fakeData(prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations) {
    console.log("\n📖 A Story of the Confused Person by Rafly Maulana 🎈");
    console.log("> 🌆 Once upon a time...");

    const usersLength = faker.datatype.number({ min: 4, max: 8 });
    console.log(`> There are ${usersLength} person that are creating accounts...`);

    let index = 0;

    while (index < usersLength) {
        const user = await prisma.user.create({
            data: {
                name: faker.name.fullName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
                phone: faker.phone.number(),
                roleId: index === 0 ? roles.user.SUPER_ADMIN.id : roles.user.USER.id,
            },
        });

        console.log(`\n> 😎 A person named ${user.name} is creating an account...`);

        if (index === 0) {
            console.log(`(Assuming that ${user.name} was the first user to be created, ${user.name} then assigned the user role "${roles.user.SUPER_ADMIN.name}" by the system)`);
        }

        await fakeOrganizations(prisma, roles, configurations, user);
        index++;
    }
}
