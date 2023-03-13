import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Organization, Project, User } from "@prisma/client";

import { DefaultRolesIds } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { ActivityAction, ActivityObject } from "@prisma/client";
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

export type GetResult = Organization[];

router.get(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        },
        select: {
            organizations: {
                select: {
                    organization: true,
                },
            },
        },
    });

    if (!user) {
        return res.status(401).json({
            error: {
                message: "User not found",
                name: "ClientError",
            },
        });
    }

    return res.status(200).json({
        result: user.organizations.map(({ organization }) => organization) as GetResult,
    });
});

export type PostResult = Organization & {
    _count: {
        users: number;
    };
    projects: (Project & {
        _count: {
            boards: number;
        };
    })[];
    users: User[];
};

const PostSchema = z.object({
    name: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name } = parsedBody.data;
    const user = req.user;

    const organization = await prisma.organization.create({
        data: {
            name,
            ownerId: user.id,
            users: {
                create: {
                    userId: user.id,
                    roleId: DefaultRolesIds.ORGANIZATION_ADMIN,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: organization.id,
            objectType: ActivityObject.ORGANIZATION,
            userId: user.id,
            creatorId: user.id,
        },
    });

    return res.status(200).json({
        result: {
            ...organization,
            projects: [],
            users: [user],
            _count: {
                users: 1,
            },
        } as PostResult,
    });
});

export default router.handler();
