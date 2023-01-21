import type { PrismaClient } from "@prisma/client";

export type DefaultRoles = Awaited<ReturnType<typeof defaultRoles>>;

const defaultRoles = async (prisma: PrismaClient) => {
    const user = async () => {
        const SUPER_ADMIN = await prisma.roles.create({
            data: {
                name: "Super Admin",
                description: "Can do everything",
                level: "USER",

                VIEW_USER: true,
                EDIT_USER: true,
                DELETE_USER: true,
                ADD_ORGANIZATION_TO_USER: true,
                REMOVE_ORGANIZATION_FROM_USER: true,

                EDIT_ORGANIZATION: true,
                DELETE_ORGANIZATION: true,
                ADD_USER_TO_ORGANIZATION: true,
                REMOVE_USER_FROM_ORGANIZATION: true,
                CREATE_PROJECT: true,

                VIEW_PROJECT: true,
                EDIT_PROJECT: true,
                DELETE_PROJECT: true,
                ADD_USER_TO_PROJECT: true,
                REMOVE_USER_FROM_PROJECT: true,
                ADD_ORGANIZATION_TO_PROJECT: true,
                REMOVE_ORGANIZATION_FROM_PROJECT: true,
                CREATE_BOARD: true,

                VIEW_BOARD: true,
                EDIT_BOARD: true,
                DELETE_BOARD: true,
                ADD_USER_TO_BOARD: true,
                REMOVE_USER_FROM_BOARD: true,
                ADD_ORGANIZATION_TO_BOARD: true,
                REMOVE_ORGANIZATION_FROM_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const USER = await prisma.roles.create({
            data: {
                name: "User",
                description: "Basic user",
                level: "USER",
            },
        });

        return {
            SUPER_ADMIN,
            USER,
        };
    };

    const organization = async () => {
        const ADMIN = await prisma.roles.create({
            data: {
                name: "Admin",
                description: "Control everything in the organization, have the ability same as the owner",
                level: "ORGANIZATION",

                EDIT_ORGANIZATION: true,
                DELETE_ORGANIZATION: true,
                ADD_USER_TO_ORGANIZATION: true,
                REMOVE_USER_FROM_ORGANIZATION: true,
                CREATE_PROJECT: true,

                VIEW_PROJECT: true,
                EDIT_PROJECT: true,
                DELETE_PROJECT: true,
                ADD_USER_TO_PROJECT: true,
                REMOVE_USER_FROM_PROJECT: true,
                ADD_ORGANIZATION_TO_PROJECT: true,
                REMOVE_ORGANIZATION_FROM_PROJECT: true,
                CREATE_BOARD: true,

                VIEW_BOARD: true,
                EDIT_BOARD: true,
                DELETE_BOARD: true,
                ADD_USER_TO_BOARD: true,
                REMOVE_USER_FROM_BOARD: true,
                ADD_ORGANIZATION_TO_BOARD: true,
                REMOVE_ORGANIZATION_FROM_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const MANAGER = await prisma.roles.create({
            data: {
                name: "Manager",
                description: "Have administator permission in the organization projects",
                level: "ORGANIZATION",

                CREATE_PROJECT: true,

                VIEW_PROJECT: true,
                EDIT_PROJECT: true,
                DELETE_PROJECT: true,
                ADD_USER_TO_PROJECT: true,
                REMOVE_USER_FROM_PROJECT: true,
                ADD_ORGANIZATION_TO_PROJECT: true,
                REMOVE_ORGANIZATION_FROM_PROJECT: true,
                CREATE_BOARD: true,

                VIEW_BOARD: true,
                EDIT_BOARD: true,
                DELETE_BOARD: true,
                ADD_USER_TO_BOARD: true,
                REMOVE_USER_FROM_BOARD: true,
                ADD_ORGANIZATION_TO_BOARD: true,
                REMOVE_ORGANIZATION_FROM_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const MEMBER = await prisma.roles.create({
            data: {
                name: "Member",
                description: "Member of the organization",
                level: "ORGANIZATION",
            },
        });

        return {
            ADMIN,
            MANAGER,
            MEMBER,
        };
    };

    const project = async () => {
        const ADMIN = await prisma.roles.create({
            data: {
                name: "Admin",
                description: "Control everything in the project",
                level: "PROJECT",

                VIEW_PROJECT: true,
                EDIT_PROJECT: true,
                DELETE_PROJECT: true,
                ADD_USER_TO_PROJECT: true,
                REMOVE_USER_FROM_PROJECT: true,
                ADD_ORGANIZATION_TO_PROJECT: true,
                REMOVE_ORGANIZATION_FROM_PROJECT: true,
                CREATE_BOARD: true,

                VIEW_BOARD: true,
                EDIT_BOARD: true,
                DELETE_BOARD: true,
                ADD_USER_TO_BOARD: true,
                REMOVE_USER_FROM_BOARD: true,
                ADD_ORGANIZATION_TO_BOARD: true,
                REMOVE_ORGANIZATION_FROM_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const MEMBER = await prisma.roles.create({
            data: {
                name: "Member",
                description: "Member of the project",
                level: "PROJECT",

                VIEW_PROJECT: true,
            },
        });

        return {
            ADMIN,
            MEMBER,
        };
    };

    const board = async () => {
        const ADMIN = await prisma.roles.create({
            data: {
                name: "Admin",
                description: "Control everything in the board",
                level: "BOARD",

                VIEW_BOARD: true,
                EDIT_BOARD: true,
                DELETE_BOARD: true,
                ADD_USER_TO_BOARD: true,
                REMOVE_USER_FROM_BOARD: true,
                ADD_ORGANIZATION_TO_BOARD: true,
                REMOVE_ORGANIZATION_FROM_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const MEMBER = await prisma.roles.create({
            data: {
                name: "Member",
                description: "Member of the board",
                level: "BOARD",

                VIEW_BOARD: true,
                CREATE_LIST: true,
                DELETE_LIST: true,
                CREATE_CARD: true,
                DELETE_CARD: true,
            },
        });

        const GUEST = await prisma.roles.create({
            data: {
                name: "Guest",
                description: "Guest of the board",
                level: "BOARD",

                VIEW_BOARD: true,
            },
        });

        return {
            ADMIN,
            MEMBER,
            GUEST,
        };
    };

    return {
        user: await user(),
        organization: await organization(),
        project: await project(),
        board: await board(),
    };
};

export type DefaultConfigurations = Awaited<ReturnType<typeof defaultConfigurations>>;

const defaultConfigurations = async (prisma: PrismaClient) => {
    const attachmentStorage = async () => {
        const LOCAL = await prisma.attachment_storage.create({
            data: {
                provider: "LOCAL",
            },
        });

        return {
            LOCAL,
        };
    };

    return {
        attachmentStorage: await attachmentStorage(),
    };
};

export default async function defaultData(prisma: PrismaClient) {
    return {
        roles: await defaultRoles(prisma),
        configurations: await defaultConfigurations(prisma),
    };
}
