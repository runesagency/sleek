import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Activity, Attachment, Card, CardAttachment, CardChecklist, CardChecklistTask, CardLabel, CardTimer, Label, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForBoard } from "@/lib/utils/get-user-permission";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ POST /api/board/cards ------------------

export type PostResult = Card & {
    users: User[];
    timers: CardTimer[];
    creator: User | null;
    labels: (CardLabel & {
        label: Label;
    })[];
    checklists: (CardChecklist & {
        tasks: CardChecklistTask[];
    })[];
    attachments: (CardAttachment & {
        attachment: Attachment;
    })[];
    activities: (Activity & {
        user: User;
    })[];
};

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

    const card = await prisma.card.create({
        data: {
            title,
            order,
            boardId,
            listId,
        },
        include: {
            timers: true,
            creator: true,
            users: {
                include: {
                    user: true,
                },
            },
            labels: {
                include: {
                    label: true,
                },
            },
            checklists: {
                include: {
                    tasks: true,
                },
            },
            attachments: {
                include: {
                    attachment: true,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: card.id,
            objectType: ActivityObject.CARD,
            userId: user.id,
            creatorId: user.id,
        },
    });

    const activities = await prisma.activity.findMany({
        where: {
            objectType: ActivityObject.CARD,
            objectId: card.id,
        },
        include: {
            user: true,
        },
    });

    const result: PostResult = {
        ...card,
        activities,
        users: card.users.map(({ user }) => user),
    };

    return res.status(200).json({ result });
});

// ------------------ PATCH /api/board/cards ------------------

export type PatchResult = {
    success: boolean;
};

export type PatchSchemaType = z.infer<typeof PatchSchema>;

const PatchSchema = z.object({
    boardId: z.string(),
    cards: z.array(
        z.object({
            id: z.string(),
            listId: z.string(),
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

    const { cards, boardId } = parsedBody.data;
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

    cards.map(async (card) => {
        try {
            await prisma.card.update({
                where: {
                    id: card.id,
                },
                data: {
                    order: card.order,
                    listId: card.listId,
                },
            });
        } catch (error) {
            return res.status(500).json({
                error: {
                    message: `Error updating card ${card.id}`,
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
