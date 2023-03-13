import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Project } from "@prisma/client";

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

export type PostResult = Project & {
    _count: {
        boards: number;
    };
};

const PostSchema = z.object({
    organizationId: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name, description, organizationId } = parsedBody.data;
    const user = req.user;

    const project = await prisma.project.create({
        data: {
            name,
            description,
            organizationId,
            creatorId: user.id,
            users: {
                create: {
                    userId: user.id,
                    adderId: user.id,
                    roleId: DefaultRolesIds.PROJECT_ADMIN,
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

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: project.id,
            objectType: ActivityObject.PROJECT,
            userId: user.id,
            creatorId: user.id,
        },
    });

    return res.status(200).json({
        result: project,
    });
});

export default router.handler();
