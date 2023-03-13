import type { Permissions } from "@/lib/utils/parse-role-to-permissions";

import { prisma } from "@/lib/prisma";
import { parseRoleToPermissions } from "@/lib/utils/parse-role-to-permissions";

export const getUserPermissions = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            role: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return parseRoleToPermissions(user.role);
};

export const getUserPermissionsForOrganization = async (userId: string, organizationId: string) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        throw new Error("Organization not found");
    }

    let inheritedPermissions = await getUserPermissions(userId);

    if (organization.ownerId === userId) {
        inheritedPermissions = {
            ...inheritedPermissions,
            EDIT_ORGANIZATION: true,
            DELETE_ORGANIZATION: true,
            ADD_USER_TO_ORGANIZATION: true,
            REMOVE_USER_FROM_ORGANIZATION: true,
            CREATE_PROJECT: true,
        };
    } else {
        const organizationUser = await prisma.organizationUser.findFirst({
            where: {
                userId: userId,
                organizationId: organization.id,
            },
            include: {
                role: true,
            },
        });

        if (!organizationUser) {
            throw new Error("User is not a member of the organization");
        }

        for (const rawKey in inheritedPermissions) {
            const key = rawKey as keyof Permissions;
            inheritedPermissions[key] = inheritedPermissions[key] || organizationUser.role[key];
        }
    }

    return inheritedPermissions;
};

export const getUserPermissionsForProject = async (userId: string, projectId: string) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const inheritedPermissions = await getUserPermissionsForOrganization(userId, project.organizationId);

    const projectUser = await prisma.projectUser.findFirst({
        where: {
            userId: userId,
            projectId: project.id,
        },
        include: {
            role: true,
        },
    });

    if (!projectUser) {
        throw new Error("User is not a member of the project");
    }

    for (const rawKey in inheritedPermissions) {
        const key = rawKey as keyof Permissions;
        inheritedPermissions[key] = inheritedPermissions[key] || projectUser.role[key];
    }

    return inheritedPermissions;
};

export const getUserPermissionsForBoard = async (userId: string, boardId: string) => {
    const board = await prisma.board.findUnique({
        where: {
            id: boardId,
        },
    });

    if (!board) {
        throw new Error("Board not found");
    }

    const inheritedPermissions = await getUserPermissionsForProject(userId, board.projectId);

    const boardUser = await prisma.boardUser.findFirst({
        where: {
            userId: userId,
            boardId: board.id,
        },
        include: {
            role: true,
        },
    });

    if (!boardUser) {
        throw new Error("User is not a member of the board");
    }

    for (const rawKey in inheritedPermissions) {
        const key = rawKey as keyof Permissions;
        inheritedPermissions[key] = inheritedPermissions[key] || boardUser.role[key];
    }

    return inheritedPermissions;
};
