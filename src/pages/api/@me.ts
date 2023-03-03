import type { ApiRequest, APIResponse } from "@/lib/types";
import type { Organization, Project, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { getServerSession } from "next-auth";
import { createRouter } from "next-connect";

const router = createRouter<ApiRequest, APIResponse>();

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

export type GetResult = User & {
    organizations: (Organization & {
        _count: {
            users: number;
        };
        projects: Project[];
        users: User[];
    })[];
};

router.get(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        },
        include: {
            organizations: {
                select: {
                    organization: {
                        include: {
                            _count: {
                                select: {
                                    users: true,
                                },
                            },
                            projects: {
                                take: 5,
                            },
                            users: {
                                take: 5,
                                select: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        return res.status(404).json({
            error: {
                message: "User not found",
                name: "ClientError",
            },
        });
    }

    return res.json({
        result: {
            ...user,
            organizations: user.organizations.map(({ organization }) => ({
                ...organization,
                users: organization.users.map(({ user }) => user),
            })),
        } as GetResult,
    });
});

export default router.handler();
