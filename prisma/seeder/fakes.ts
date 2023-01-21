/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { DefaultAttachmentStorage, DefaultRoles } from "./defaults";
import type { boards, lists, organizations, PrismaClient, projects, users } from "@prisma/client";

import { faker } from "@faker-js/faker";

const fakeOrganizations = async (prisma: PrismaClient, roles: DefaultRoles, user: users) => {
    const length = faker.datatype.number({ min: 0, max: 3 });
    if (length === 0) return;

    console.log(`${user.name} is planning to create ${length} organizations...`);

    for (let o = 0; o < length; o++) {
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

        console.log(`${user.name} is creating an organization named ${organization.name}...`);

        // Add users to the organization
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`${user.name} is thinking about adding another user to the organization...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            if (anotherUsers.length > 0) {
                anotherUsers.map(async (user) => {
                    const roleGiven = faker.helpers.arrayElement([roles.organization.ADMIN, roles.organization.MANAGER, roles.organization.MEMBER]);

                    await prisma.organization_users.create({
                        data: {
                            user_id: user.id,
                            organization_id: organization.id,
                            role_id: roleGiven.id,
                            adder_id: user.id,
                        },
                    });

                    if (roleGiven.id !== roles.organization.MEMBER.id) {
                        members.push(user);
                    }

                    console.log(`${user.name} is adding ${user.name} users to the organization and giving them the role ${roleGiven.name}...`);
                });
            }
        }

        members.map(async (user) => {
            await fakeProjects(prisma, roles, user, organization);
        });
    }
};

const fakeProjects = async (prisma: PrismaClient, roles: DefaultRoles, user: users, organization: organizations) => {
    const length = faker.datatype.number({ min: 0, max: 5 });
    if (length === 0) return;

    console.log(`${user.name} is planning to create ${length} projects...`);

    for (let p = 0; p < length; p++) {
        // List of users in the project that can create boards
        let members: users[] = [user];

        // Create the project
        const projectName = faker.commerce.productName();
        console.log(`${user.name} is creating a first project named ${projectName}...`);

        const project = await prisma.projects.create({
            data: {
                name: projectName,
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

        // Add users to the project
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`${user.name} is thinking about adding another user to the organization...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            if (anotherUsers.length > 0) {
                anotherUsers.map(async (user) => {
                    const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                    await prisma.project_users.create({
                        data: {
                            user_id: user.id,
                            project_id: project.id,
                            role_id: roleGiven.id,
                            adder_id: user.id,
                        },
                    });

                    if (roleGiven.id !== roles.project.MEMBER.id) {
                        members.push(user);
                    }

                    console.log(`${user.name} is adding ${user.name} users to the project and giving them the role ${roleGiven.name}...`);
                });
            }
        }

        // Add organizations to the project
        const addOrganization = faker.datatype.boolean();

        if (addOrganization) {
            console.log(`${user.name} is thinking about adding another organization to the project...`);

            const anotherOrganizations = await prisma.organizations.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: organization.id,
                    },
                },
            });

            if (anotherOrganizations.length > 0) {
                anotherOrganizations.map(async (organization) => {
                    const roleGiven = faker.helpers.arrayElement([roles.project.ADMIN, roles.project.MEMBER]);

                    await prisma.project_organizations.create({
                        data: {
                            organization_id: organization.id,
                            project_id: project.id,
                            role_id: roleGiven.id,
                            adder_id: user.id,
                        },
                    });

                    if (roleGiven.id !== roles.project.MEMBER.id) {
                        members.push(user);
                    }

                    console.log(`${user.name} is adding ${organization.name} organization to the project and giving them the role ${roleGiven.name}...`);
                });
            }
        }

        members.map(async (user) => {
            await fakeBoards(prisma, roles, user, project);
        });
    }
};

const fakeBoards = async (prisma: PrismaClient, roles: DefaultRoles, user: users, project: projects) => {
    const length = faker.datatype.number({ min: 0, max: 3 });
    if (length === 0) return;

    console.log(`${user.name} is planning to create ${length} boards for the project ${project.name}...`);

    for (let b = 0; b < length; b++) {
        // List of users in the board that can create lists and cards
        let members: users[] = [user];

        // Create the board
        const boardName = faker.commerce.productName();
        console.log(`${user.name} is creating a board named ${boardName} for the project ${project.name}...`);

        const board = await prisma.boards.create({
            data: {
                name: boardName,
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

        // Add users to the board
        const addUser = faker.datatype.boolean();

        if (addUser) {
            console.log(`${user.name} is thinking about adding another user to the organization...`);

            const anotherUsers = await prisma.users.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
            });

            if (anotherUsers.length > 0) {
                anotherUsers.map(async (user) => {
                    const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                    await prisma.board_users.create({
                        data: {
                            user_id: user.id,
                            board_id: board.id,
                            role_id: roleGiven.id,
                            adder_id: user.id,
                        },
                    });

                    if (roleGiven.id !== roles.board.GUEST.id) {
                        members.push(user);
                    }

                    console.log(`${user.name} is adding ${user.name} users to the project and giving them the role ${roleGiven.name}...`);
                });
            }
        }

        // Add organizations to the board
        const addOrganization = faker.datatype.boolean();

        if (addOrganization) {
            console.log(`${user.name} is thinking about adding another organization to the project...`);

            const anotherOrganizations = await prisma.organizations.findMany({
                take: faker.datatype.number({ min: 1, max: 3 }),
                where: {
                    id: {
                        not: project.organization_id,
                    },
                },
            });

            if (anotherOrganizations.length > 0) {
                anotherOrganizations.map(async (organization) => {
                    const roleGiven = faker.helpers.arrayElement([roles.board.ADMIN, roles.board.MEMBER, roles.board.GUEST]);

                    await prisma.board_organizations.create({
                        data: {
                            organization_id: organization.id,
                            board_id: board.id,
                            role_id: roleGiven.id,
                            adder_id: user.id,
                        },
                    });

                    if (roleGiven.id !== roles.board.GUEST.id) {
                        members.push(user);
                    }

                    console.log(`${user.name} is adding ${organization.name} organization to the project and giving them the role ${roleGiven.name}...`);
                });
            }
        }

        members.map(async (user) => {
            await fakeLists(prisma, user, board);
        });
    }
};

const fakeLists = async (prisma: PrismaClient, user: users, board: boards) => {
    const length = faker.datatype.number({ min: 1, max: 10 });

    console.log(`${user.name} is planning to create ${length} lists for the board ${board.name}...`);

    for (let i = 0; i < length; i++) {
        const listName = faker.random.word();
        console.log(`${user.name} is adding a list named ${listName} for the board ${board.name}...`);

        const list = await prisma.lists.create({
            data: {
                title: listName,
                description: faker.commerce.productDescription(),
                order: i,
                locked: faker.datatype.boolean(),
                board_id: board.id,
                creator_id: user.id,
            },
        });

        await fakeCards(prisma, user, board, list);
    }
};

const fakeCards = async (prisma: PrismaClient, user: users, board: boards, list: lists) => {
    const length = faker.datatype.number({ min: 0, max: 12 });
    if (length === 0) return;

    console.log(`${user.name} is planning to create ${length} cards for the list ${list.title}...`);

    for (let i = 0; i < length; i++) {
        const cardName = faker.commerce.productName();
        console.log(`${user.name} assigning a card named ${cardName} to list ${list.title}...`);

        await prisma.cards.create({
            data: {
                title: cardName,
                description: faker.commerce.productDescription(),
                list_id: list.id,
                board_id: board.id,
                creator_id: user.id,
                order: i,
            },
        });
    }
};

export default async function fakesData(prisma: PrismaClient, roles: DefaultRoles, storage: DefaultAttachmentStorage) {
    console.log("Once upon a time...");

    const usersLength = faker.datatype.number({ min: 4, max: 10 });
    console.log(`There are ${usersLength} person that are creating accounts...`);

    for (let i = 0; i < usersLength; i++) {
        console.log("\n");

        const user = await prisma.users.create({
            data: {
                name: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                username: faker.internet.userName(),
                phone: faker.phone.number(),
                role_id: i === 0 ? roles.user.SUPER_ADMIN.id : roles.user.USER.id,
            },
        });

        console.log(`A person named ${user.name} is creating an account...`);

        if (i === 0) {
            console.log(`(Assuming that ${user.name} was the first user to be created, ${user.name} then assigned the user role "${roles.user.SUPER_ADMIN.name}" by the system)`);
        }

        await fakeOrganizations(prisma, roles, user);
    }
}
