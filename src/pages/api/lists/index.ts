import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { List } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForBoard } from "@/lib/utils/get-user-permission";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ POST /api/board/lists ------------------

export type PostResult = List;

export type PostSchemaType = z.infer<typeof PostSchema>;

const PostSchema = z.object({
    title: z.string(),
    order: z.number(),
    boardId: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { title, order, boardId } = parsedBody.data;
    const user = req.user;

    const { permissions, error: permissionError } = await getUserPermissionsForBoard(user.id, boardId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.CREATE_LIST) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to create a list",
                name: "ClientError",
            },
        });
    }

    const list = await prisma.list.create({
        data: {
            title,
            order,
            boardId,
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

// ------------------ PATCH /api/board/lists ------------------

export type PatchResult = {
    success: boolean;
};

export type PatchSchemaType = z.infer<typeof PatchSchema>;

const PatchSchema = z.object({
    boardId: z.string(),
    lists: z.array(
        z.object({
            id: z.string(),
            order: z.number(),
        })
    ),
});

router.patch(async (req, res) => {
    const parsedBody = PatchSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { lists, boardId } = parsedBody.data;
    const user = req.user;

    const { permissions, error: permissionError } = await getUserPermissionsForBoard(user.id, boardId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.CREATE_LIST) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to create a card",
                name: "ClientError",
            },
        });
    }

    lists.map(async (list) => {
        try {
            await prisma.list.update({
                where: {
                    id: list.id,
                },
                data: {
                    order: list.order,
                },
            });
        } catch (error) {
            return res.status(500).json({
                error: {
                    message: `Error updating list ${list.id}`,
                    name: "ServerError",
                },
            });
        }
    });

    const result: PatchResult = {
        success: true,
    };

    return res.status(200).json({ result });
});

export default router.handler();
