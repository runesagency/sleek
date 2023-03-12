import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Organization, Project, Role, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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

const GetSchema = z.object({});

router.get(async (req, res) => {
    const parsedBody = GetSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

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

    const projects = await prisma.project.findMany({
        where: {
            AND: [
                { organizationId },
                {
                    OR: [
                        // User is a member of one of the boards of the project
                        {
                            boards: {
                                some: {
                                    users: {
                                        some: {
                                            id: user.id,
                                            role: {
                                                VIEW_BOARD: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        // User is a member of the project
                        {
                            users: {
                                some: {
                                    id: user.id,
                                    role: {
                                        VIEW_PROJECT: true,
                                    },
                                },
                            },
                        },
                        // User has VIEW_PROJECT roles on the organization level that
                        // allows to see all projects of the organization
                        {
                            organization: {
                                users: {
                                    some: {
                                        id: user.id,
                                        role: {
                                            VIEW_PROJECT: true,
                                        },
                                    },
                                },
                            },
                        },
                        // User is the owner of the organization
                        {
                            organization: {
                                ownerId: user.id,
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            _count: {
                select: {
                    boards: true,
                },
            },
        },
    });

    const externalProjects = await prisma.project.findMany({
        where: {
            AND: [
                {
                    organizationId: {
                        not: organizationId,
                    },
                },
                {
                    OR: [
                        // The current organization is a member
                        // of one of the boards in the project
                        {
                            boards: {
                                some: {
                                    organizations: {
                                        some: {
                                            id: organizationId,
                                            role: {
                                                VIEW_BOARD: true,
                                            },
                                        },
                                    },
                                },
                            },
                            users: {
                                some: {
                                    id: user.id,
                                },
                            },
                        },
                        // The current organization was added
                        // as a member on the project
                        {
                            organizations: {
                                some: {
                                    id: organizationId,
                                    role: {
                                        VIEW_PROJECT: true,
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            _count: {
                select: {
                    boards: true,
                },
            },
        },
    });

    const users = organization.users.map(({ user }) => user);

    return res.status(200).json({
        result: {
            ...organization,
            users,
            projects,
            externalProjects,
        } as GetResult,
    });
});

export default router.handler();
