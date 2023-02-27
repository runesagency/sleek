import type { PrismaClient } from "@prisma/client";

import { DefaultRolesIds, DefaultStorageIds } from "../../src/lib/constants";

import { StorageProvider, RoleLevel } from "@prisma/client";

let prisma: PrismaClient;

export type DefaultRoles = Awaited<ReturnType<typeof getDefaultRoles>>;

const getDefaultRoles = async () => {
    // SUPER_ADMIN
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.SUPER_ADMIN,
        },
        create: {
            id: DefaultRolesIds.SUPER_ADMIN,
            name: "Super Admin",
            description: "Can do everything",
            level: RoleLevel.USER,

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
        update: {},
    });

    // USER
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.USER,
        },
        create: {
            id: DefaultRolesIds.USER,
            name: "User",
            description: "Basic user",
            level: RoleLevel.USER,
        },
        update: {},
    });

    // ORGANIZATION_ADMIN
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.ORGANIZATION_ADMIN,
        },
        create: {
            id: DefaultRolesIds.ORGANIZATION_ADMIN,
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
        update: {},
    });

    // ORGANIZATION_MANAGER
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.ORGANIZATION_MANAGER,
        },
        create: {
            id: DefaultRolesIds.ORGANIZATION_MANAGER,
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
        update: {},
    });

    // ORGANIZATION_MEMBER
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.ORGANIZATION_MEMBER,
        },
        create: {
            id: DefaultRolesIds.ORGANIZATION_MEMBER,
            name: "Member",
            description: "Member of the organization",
            level: "ORGANIZATION",
        },
        update: {},
    });

    // PROJECT_ADMIN
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.PROJECT_ADMIN,
        },
        create: {
            id: DefaultRolesIds.PROJECT_ADMIN,
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
        update: {},
    });

    // PROJECT_MEMBER
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.PROJECT_MEMBER,
        },
        create: {
            id: DefaultRolesIds.PROJECT_MEMBER,
            name: "Member",
            description: "Member of the project",
            level: "PROJECT",

            VIEW_PROJECT: true,
        },
        update: {},
    });

    // BOARD_ADMIN
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.BOARD_ADMIN,
        },
        create: {
            id: DefaultRolesIds.BOARD_ADMIN,
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
        update: {},
    });

    // BOARD_MEMBER
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.BOARD_MEMBER,
        },
        create: {
            id: DefaultRolesIds.BOARD_MEMBER,
            name: "Member",
            description: "Member of the board",
            level: "BOARD",

            VIEW_BOARD: true,
            CREATE_LIST: true,
            DELETE_LIST: true,
            CREATE_CARD: true,
            DELETE_CARD: true,
        },
        update: {},
    });

    // BOARD_GUEST
    await prisma.role.upsert({
        where: {
            id: DefaultRolesIds.BOARD_GUEST,
        },
        create: {
            id: DefaultRolesIds.BOARD_GUEST,
            name: "Guest",
            description: "Guest of the board",
            level: "BOARD",

            VIEW_BOARD: true,
        },
        update: {},
    });
};

const getDefaultConfigurations = async () => {
    // LOCAL
    await prisma.storage.upsert({
        where: {
            id: DefaultStorageIds.LOCAL,
        },
        create: {
            id: DefaultStorageIds.LOCAL,
            provider: StorageProvider.LOCAL,
        },
        update: {},
    });
};

export default async function getDefaultData(prismaInstance: PrismaClient) {
    prisma = prismaInstance;

    await getDefaultRoles();
    await getDefaultConfigurations();
}
