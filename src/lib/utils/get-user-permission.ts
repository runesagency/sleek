import type { Permission, PermissionResult } from "@/lib/types";

import { prisma } from "@/lib/prisma";
import { parseRoleToPermissions } from "@/lib/utils/parse-role-to-permissions";

export const getUserPermissions = async (userId: string): Promise<PermissionResult> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            role: true,
        },
    });

    if (!user) {
        return {
            error: {
                message: "User not found",
                name: "ClientError",
            },
        };
    }

    return {
        permissions: parseRoleToPermissions(user.role),
    };
};

export const getUserPermissionsForOrganization = async (userId: string, organizationId: string): Promise<PermissionResult> => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!organization) {
        return {
            error: {
                message: "Organization not found",
                name: "ClientError",
            },
        };
    }

    const { error, permissions } = await getUserPermissions(userId);

    if (error) {
        return { error };
    }

    if (organization.ownerId === userId) {
        permissions.EDIT_ORGANIZATION = true;
        permissions.DELETE_ORGANIZATION = true;
        permissions.ADD_USER_TO_ORGANIZATION = true;
        permissions.REMOVE_USER_FROM_ORGANIZATION = true;
        permissions.CREATE_PROJECT = true;
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
            return {
                error: {
                    message: "User is not a member of the organization",
                    name: "ClientError",
                },
            };
        }

        for (const rawKey in permissions) {
            const key = rawKey as keyof Permission;
            permissions[key] = permissions[key] || organizationUser.role[key];
        }
    }

    return { permissions };
};

export const getUserPermissionsForProject = async (userId: string, projectId: string): Promise<PermissionResult> => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        return {
            error: {
                message: "Project not found",
                name: "ClientError",
            },
        };
    }

    const { permissions, error } = await getUserPermissionsForOrganization(userId, project.organizationId);

    if (error) {
        return { error };
    }

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
        return {
            error: {
                message: "User is not a member of the project",
                name: "ClientError",
            },
        };
    }

    for (const rawKey in permissions) {
        const key = rawKey as keyof Permission;
        permissions[key] = permissions[key] || projectUser.role[key];
    }

    return { permissions };
};

export const getUserPermissionsForBoard = async (userId: string, boardId: string): Promise<PermissionResult> => {
    const board = await prisma.board.findUnique({
        where: {
            id: boardId,
        },
    });

    if (!board) {
        return {
            error: {
                message: "Board not found",
                name: "ClientError",
            },
        };
    }

    const { permissions, error } = await getUserPermissionsForProject(userId, board.projectId);

    if (error) {
        return { error };
    }

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
        return {
            error: {
                message: "User is not a member of the board",
                name: "ClientError",
            },
        };
    }

    for (const rawKey in permissions) {
        const key = rawKey as keyof Permission;
        permissions[key] = permissions[key] || boardUser.role[key];
    }

    return { permissions };
};
