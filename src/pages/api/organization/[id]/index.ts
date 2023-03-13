import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Organization, Project, Role, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getOrganizationPermissionsForBoard, getOrganizationPermissionsForProject } from "@/lib/utils/get-organization-permission";
import { getUserPermissionsForProject } from "@/lib/utils/get-user-permission";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { getServerSession } from "next-auth/next";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);

    if (session && session.user && session.user.email) {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (user) {
            req.user = user;
            return next();
        }
    } else {
        // get bearer token from header
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const [tokenType, tokenCode] = authHeader.split(" ");

            if (tokenType === "Bearer" && tokenCode) {
                console.log(tokenCode);
                // WIP: get user from token
            }
        }
    }

    return res.status(401).end();
});

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

    let projects: Project[] = [];

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
        const permission = await getUserPermissionsForProject(user.id, project.id);

        if (permission.VIEW_PROJECT) {
            projects.push(project);
        }
    }

    let externalProjects: Project[] = [];

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
        const permission = await getOrganizationPermissionsForProject(organizationId, project.id);

        if (permission.VIEW_PROJECT) {
            externalProjects.push(project);
        }
    }

    const users = organization.users.map(({ user }) => user);

    return res.status(200).json({
        result: {
            ...organization,
            users,
            projects: allProjects,
            externalProjects: allExternalProjects,
        } as GetResult,
    });
});

export default router.handler();
