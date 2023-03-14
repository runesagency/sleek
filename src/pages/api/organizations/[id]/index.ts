import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Organization, Project, Role, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getOrganizationPermissionsForProject } from "@/lib/utils/get-organization-permission";
import { getUserPermissionsForProject } from "@/lib/utils/get-user-permission";

import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ GET /api/organization/[id] ------------------

export type GetResult = Organization & {
    users: User[];
    customRoles: Role[];
    projects: (Project & {
        _count: {
            boards: number;
        };
    })[];
    externalProjects: (Project & {
        _count: {
            boards: number;
        };
    })[];
};

router.get(async (req, res) => {
    const user = req.user;
    const organizationId = req.query.id as string;

    const organization = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
        include: {
            customRoles: true,
            users: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!organization) {
        return res.status(404).json({
            error: {
                message: "Organization not found",
                name: "ClientError",
            },
        });
    }

    if (organization.ownerId !== user.id && !organization.users.some(({ userId }) => userId === user.id)) {
        return res.status(403).json({
            error: {
                message: "You are not authorized to access this resource",
                name: "ClientError",
            },
        });
    }

    let projects: GetResult["projects"] = [];

    const allProjects = await prisma.project.findMany({
        where: {
            organizationId,
        },
        include: {
            _count: {
                select: {
                    boards: true,
                },
            },
        },
    });

    for (const project of allProjects) {
        const { permissions, error } = await getUserPermissionsForProject(user.id, project.id);

        if (error) {
            return res.status(403).json({
                error: {
                    message: error.message,
                    name: "ClientError",
                },
            });
        }

        if (permissions.VIEW_PROJECT) {
            projects.push(project);
        }
    }

    let externalProjects: GetResult["externalProjects"] = [];

    const allExternalProjects = await prisma.project.findMany({
        where: {
            AND: {
                organizationId: {
                    not: organizationId,
                },
                OR: {
                    organizations: {
                        some: {
                            organizationId,
                        },
                    },
                    boards: {
                        some: {
                            organizations: {
                                some: {
                                    organizationId,
                                },
                            },
                        },
                    },
                },
            },
        },
        include: {
            _count: {
                select: {
                    boards: true,
                },
            },
        },
    });

    for (const project of allExternalProjects) {
        const { permissions, error } = await getOrganizationPermissionsForProject(organizationId, project.id);

        if (error) {
            return res.status(403).json({
                error: {
                    message: error.message,
                    name: "ClientError",
                },
            });
        }

        if (permissions.VIEW_PROJECT) {
            externalProjects.push(project);
        }
    }

    const users = organization.users.map(({ user }) => user);

    const result: GetResult = {
        ...organization,
        users,
        projects,
        externalProjects,
    };

    return res.status(200).json({ result });
});

export default router.handler();
