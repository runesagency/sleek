import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseRoleToPermissions } from "@/lib/utils/parse-role-to-permissions";

export const getOrganizationPermissionsForProject = async (organizationId: string, projectId: string) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new Error("Project not found");
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
            throw new Error("Organization is not a member of the project");
        }

        role = projectOrganization.role;
    }

    return parseRoleToPermissions(role);
};

export const getOrganizationPermissionsForBoard = async (organizationId: string, boardId: string) => {
    const board = await prisma.board.findUnique({
        where: {
            id: boardId,
        },
    });

    if (!board) {
        throw new Error("Board not found");
    }

    const inheritedPermissions = await getOrganizationPermissionsForProject(organizationId, board.projectId);

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
        throw new Error("Organization is not a member of the board");
    }

    for (const rawKey in inheritedPermissions) {
        const key = rawKey as keyof typeof inheritedPermissions;
        inheritedPermissions[key] = inheritedPermissions[key] || boardOrganization.role[key];
    }

    return inheritedPermissions;
};
