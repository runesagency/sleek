import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Card } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForBoard } from "@/lib/utils/get-user-permission";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ POST /api/board/card ------------------

export type PostResult = Card;

export type PostSchemaType = z.infer<typeof PostSchema>;

const PostSchema = z.object({
    title: z.string(),
    order: z.number(),
    listId: z.string(),
    boardId: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { title, order, listId, boardId } = parsedBody.data;
    const user = req.user;

    const { permissions, error: permissionError } = await getUserPermissionsForBoard(user.id, boardId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.CREATE_CARD) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to create a card",
                name: "ClientError",
            },
        });
    }

    const list = await prisma.card.create({
        data: {
            title,
            order,
            boardId,
            listId,
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: list.id,
            objectType: ActivityObject.LIST,
            userId: user.id,
            creatorId: user.id,
        },
    });

    const result: PostResult = list;

    return res.status(200).json({ result });
});

export default router.handler();
