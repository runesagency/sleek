import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Organization, Project, User } from "@prisma/client";

import { DefaultRolesIds } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ GET /api/organizations ------------------

export type GetResult = (Organization & {
    users: User[];
})[];

router.get(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        },
        select: {
            organizations: {
                select: {
                    organization: {
                        include: {
                            users: {
                                include: {
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
        return res.status(401).json({
            error: {
                message: "User not found",
                name: "ClientError",
            },
        });
    }

    const result: GetResult = user.organizations.map(({ organization }) => ({
        ...organization,
        users: organization.users.map(({ user }) => user),
    }));

    return res.status(200).json({ result });
});

// ------------------ POST /api/organizations ------------------

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

export type PostSchemaType = z.infer<typeof PostSchema>;

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
        include: {
            users: {
                include: {
                    user: true,
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

    const result: PostResult = {
        ...organization,
        projects: [],
        users: organization.users.map(({ user, roleId }) => ({
            ...user,
            roleId,
        })),
        _count: {
            users: 1,
        },
    };

    return res.status(200).json({ result });
});

export default router.handler();
