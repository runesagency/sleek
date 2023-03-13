import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Board } from "@prisma/client";

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
    }

    return res.status(401).end();
});

export type PostResult = Board;

const PostSchema = z.object({
    name: z.string(),
    projectId: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name, projectId } = parsedBody.data;
    const user = req.user;

    const board = await prisma.board.create({
        data: {
            name,
            creatorId: user.id,
            projectId,
            users: {
                create: {
                    userId: user.id,
                    roleId: DefaultRolesIds.BOARD_ADMIN,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: board.id,
            objectType: ActivityObject.BOARD,
            userId: user.id,
            creatorId: user.id,
        },
    });

    return res.status(200).json({
        result: board as PostResult,
    });
});

export default router.handler();
