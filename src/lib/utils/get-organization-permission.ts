import type { PermissionResult } from "@/lib/types";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseRoleToPermissions } from "@/lib/utils/parse-role-to-permissions";

export const getOrganizationPermissionsForProject = async (organizationId: string, projectId: string): Promise<PermissionResult> => {
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

    let role = {} as Role;

    if (project.organizationId === organizationId) {
        role = {
            ...role,
            VIEW_PROJECT: true,
            EDIT_PROJECT: true,
            DELETE_PROJECT: true,
            ADD_USER_TO_PROJECT: true,
            REMOVE_USER_FROM_PROJECT: true,
            ADD_ORGANIZATION_TO_PROJECT: true,
            REMOVE_ORGANIZATION_FROM_PROJECT: true,
            CREATE_BOARD: true,
        };
    } else {
        const projectOrganization = await prisma.projectOrganization.findFirst({
            where: {
                projectId: project.id,
                organizationId: organizationId,
            },
            include: {
                role: true,
            },
        });

        if (!projectOrganization) {
            return {
                error: {
                    message: "Organization is not a member of the project",
                    name: "ClientError",
                },
            };
        }

        role = projectOrganization.role;
    }

    return {
        permissions: parseRoleToPermissions(role),
    };
};

export const getOrganizationPermissionsForBoard = async (organizationId: string, boardId: string): Promise<PermissionResult> => {
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

    const { permissions, error } = await getOrganizationPermissionsForProject(organizationId, board.projectId);

    if (error) {
        return { error };
    }

    const boardOrganization = await prisma.boardOrganization.findFirst({
        where: {
            boardId: board.id,
            organizationId: organizationId,
        },
        include: {
            role: true,
        },
    });

    if (!boardOrganization) {
        return {
            error: {
                message: "Organization is not a member of the board",
                name: "ClientError",
            },
        };
    }

    for (const rawKey in permissions) {
        const key = rawKey as keyof typeof permissions;
        permissions[key] = permissions[key] || boardOrganization.role[key];
    }

    return { permissions };
};
