/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { DefaultConfigurations, DefaultRoles } from "./defaults";
import type { boards, lists, organizations, PrismaClient, projects, users } from "@prisma/client";

import { faker } from "@faker-js/faker";

const fakeOrganizations = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: users) => {
    const length = faker.datatype.number({ min: 0, max: 2 });
    if (length === 0) return;

    console.log(`> 🤔 It seems that ${user.name} is planning to create ${length} organizations...`);

    let index = 0;

    while (index < length) {
        // List of users in the organization that can create projects
        let members: users[] = [user];

        // Create the organization
        const organization = await prisma.organizations.create({
            data: {
                name: faker.company.name(),
                description: faker.company.catchPhrase(),
                owner_id: user.id,
                creator_id: user.id,
            },
        });

        console.log(`> 🛡 He/She then creating an organization named ${organization.name}...`);

        // Add users to the organization
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 He/She also thinking about adding another user to the organization...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.organization.ADMIN, roles.organization.MANAGER, roles.organization.MEMBER]);

                await prisma.organization_users.create({
                    data: {
                        user_id: invitedUser.id,
                        organization_id: organization.id,
                        role_id: roleGiven.id,
                        adder_id: user.id,
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

const fakeProjects = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: users, organization: organizations) => {
    const length = faker.datatype.number({ min: 0, max: 2 });
    if (length === 0) return;

    console.log(`> 🤑 Since become an entrepreneur, ${user.name} has been thinking to create ${length} projects...`);

    let index = 0;

    while (index < length) {
        // List of users in the project that can create boards
        let members: users[] = [user];

        // Create the project
        const project = await prisma.projects.create({
            data: {
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                password: faker.datatype.boolean() ? faker.internet.password() : null,
                start_date: faker.datatype.boolean() ? faker.date.past() : null,
                due_date: faker.datatype.boolean() ? faker.date.future() : null,
                organization_id: organization.id,
                creator_id: user.id,
            },
        });

        await prisma.project_users.create({
            data: {
                user_id: user.id,
                project_id: project.id,
                role_id: roles.project.ADMIN.id,
                adder_id: user.id,
            },
        });

        console.log(`> 🧪 He/She then initiate project named ${project.name}...`);

        // Add users to the project
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 He/She wants another user to the project...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                await prisma.project_users.create({
                    data: {
                        user_id: invitedUser.id,
                        project_id: project.id,
                        role_id: roleGiven.id,
                        adder_id: user.id,
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

            const anotherOrganizations = await prisma.organizations.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: organization.id,
                    },
                },
            });

            for (const invitedOrganization of anotherOrganizations) {
                const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                await prisma.project_organizations.create({
                    data: {
                        organization_id: invitedOrganization.id,
                        project_id: project.id,
                        role_id: roleGiven.id,
                        adder_id: user.id,
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

const fakeBoards = async (prisma: PrismaClient, roles: DefaultRoles, configurations: DefaultConfigurations, user: users, project: projects) => {
    const length = faker.datatype.number({ min: 0, max: 5 });
    if (length === 0) return;

    console.log(`> In order to make ${project.name} project successful, ${user.name} then create ${length} boards for the project...`);

    let index = 0;

    while (index < length) {
        // List of users in the board that can create lists and cards
        let members: users[] = [user];

        // Create the board
        const board = await prisma.boards.create({
            data: {
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                locked: faker.datatype.boolean(),
                password: faker.datatype.boolean() ? faker.internet.password() : null,
                project_id: project.id,
                creator_id: user.id,
            },
        });

        await prisma.board_users.create({
            data: {
                user_id: user.id,
                board_id: board.id,
                role_id: roles.board.ADMIN.id,
                adder_id: user.id,
            },
        });

        console.log(`> 📟 And by that, ${board.name} board is created...`);

        // Add users to the board
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`> 🤝 ${user.name} wants another user to the board...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            for (const invitedUser of anotherUsers) {
                const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                await prisma.board_users.create({
                    data: {
                        user_id: invitedUser.id,
                        board_id: board.id,
                        role_id: roleGiven.id,
                        adder_id: user.id,
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

            const anotherOrganizations = await prisma.organizations.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: project.organization_id,
                    },
                },
            });

            for (const invitedOrganization of anotherOrganizations) {
                const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                await prisma.board_organizations.create({
                    data: {
                        organization_id: invitedOrganization.id,
                        board_id: board.id,
                        role_id: roleGiven.id,
                        adder_id: user.id,
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

const fakeLists = async (prisma: PrismaClient, configurations: DefaultConfigurations, user: users, board: boards) => {
    const length = faker.datatype.number({ min: 1, max: 5 });

    console.log(`> To make ${board.name} successful, ${user.name} then create ${length} lists (steps) for the board...`);

    let index = 0;

    while (index < length) {
        const list = await prisma.lists.create({
            data: {
                title: faker.random.word(),
                description: faker.commerce.productDescription(),
                order: index,
                locked: faker.datatype.boolean(),
                board_id: board.id,
                creator_id: user.id,
            },
        });

        console.log(`List: *${index + 1}. ${list.title}*`);

        await fakeCards(prisma, configurations, user, board, list);

        index++;
    }
};

const fakeCards = async (prisma: PrismaClient, configurations: DefaultConfigurations, user: users, board: boards, list: lists) => {
    const length = faker.datatype.number({ min: 0, max: 6 });
    if (length === 0) return;

    console.log(`> ${user.name} then create ${length} cards (tasks) for the list ${list.title}...`);

    let index = 0;

    while (index < length) {
        const card = await prisma.cards.create({
            data: {
                title: faker.commerce.productName(),
                description: faker.lorem.paragraphs(),
                list_id: list.id,
                board_id: board.id,
                creator_id: user.id,
                order: index,
            },
        });

        console.log(`Card: *${index + 1}. ${card.title}*`);

        const availableBoardMembers = await prisma.users.findMany({
            where: {
                boards: {
                    some: {
                        board_id: board.id,
                    },
                },
            },
        });

        // Add labels to the card
        const addLabel = faker.datatype.boolean();

        if (addLabel) {
            const availableLabels = await prisma.labels.findMany({
                where: {
                    OR: {
                        cards: {
                            some: {
                                card: {
                                    board_id: board.id,
                                },
                            },
                        },
                        creator_id: user.id,
                    },
                },
            });

            if (availableLabels.length > 0) {
                const labels = faker.helpers.arrayElements(availableLabels);

                await prisma.card_labels.createMany({
                    data: labels.map((label) => ({
                        label_id: label.id,
                        adder_id: user.id,
                        card_id: card.id,
                    })),
                });

                console.log(`> ${user.name} then add a multiple label to the card ${card.title}...`);
            } else {
                const newLabelCount = faker.datatype.number({ min: 1, max: 5 });
                let newLabelIndex = 0;

                while (newLabelIndex < newLabelCount) {
                    const label = await prisma.labels.create({
                        data: {
                            name: faker.random.word(),
                            description: faker.commerce.productDescription(),
                            color: faker.color.rgb({ format: "hex" }),
                            creator_id: user.id,
                            cards: {
                                create: {
                                    card_id: card.id,
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

            await prisma.card_users.createMany({
                data: members.map((member) => ({
                    card_id: card.id,
                    adder_id: user.id,
                    subscribed: faker.datatype.boolean(),
                    user_id: member.id,
                })),
            });

            console.log(`> ${user.name} then add a multiple member to the card ${card.title}...`);
        }

        // Add timer to the card
        const addTimer = faker.datatype.boolean();

        if (addTimer) {
            const isEnded = faker.datatype.boolean();
            await prisma.card_timers.create({
                data: {
                    card_id: card.id,
                    description: faker.commerce.productDescription(),
                    started_at: faker.date.recent(2),
                    starter_id: user.id,
                    ended_at: isEnded ? faker.date.recent(1) : null,
                    ender_id: isEnded ? user.id : null,
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
                const checklist = await prisma.card_checklists.create({
                    data: {
                        title: faker.commerce.productName(),
                        card_id: card.id,
                        creator_id: user.id,
                    },
                });

                console.log(`> ${user.name} then add a checklist ${checklist.title} to the card ${card.title}...`);

                const taskTotal = faker.datatype.number({ min: 0, max: 5 });
                let taskIndex = 0;

                while (taskIndex < taskTotal) {
                    const checklistItem = await prisma.card_checklist_tasks.create({
                        data: {
                            title: faker.commerce.productName(),
                            checklist_id: checklist.id,
                            order: taskIndex,
                            completed: faker.datatype.boolean(),
                            creator_id: user.id,
                        },
                    });

                    console.log(`> ${user.name} then add a checklist item ${checklistItem.title} to the checklist ${checklist.title}...`);

                    const addMember = faker.datatype.boolean();

                    if (addMember && availableBoardMembers.length > 0) {
                        const member = faker.helpers.arrayElements(availableBoardMembers);

                        await prisma.card_checklist_task_users.createMany({
                            data: member.map((user) => ({
                                task_id: checklistItem.id,
                                adder_id: user.id,
                                user_id: user.id,
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
        const user = await prisma.users.create({
            data: {
                name: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                username: faker.internet.userName(),
                phone: faker.phone.number(),
                role_id: index === 0 ? roles.user.SUPER_ADMIN.id : roles.user.USER.id,
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
