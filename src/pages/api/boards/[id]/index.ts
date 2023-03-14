import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Activity, Attachment, Board, Card, CardAttachment, CardChecklist, CardChecklistTask, CardLabel, CardTimer, Label, List, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForBoard } from "@/lib/utils/get-user-permission";

import { ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ GET /api/board/[id] ------------------

export type GetResult = Board & {
    users: User[];
    lists: List[];
    cards: (Card & {
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
    })[];
};

router.get(async (req, res) => {
    const user = req.user;
    const boardId = req.query.id as string;

    const { permissions, error: permissionError } = await getUserPermissionsForBoard(user.id, boardId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.VIEW_BOARD) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to view this board",
                name: "ClientError",
            },
        });
    }

    const board = await prisma.board.findUnique({
        where: {
            id: boardId,
        },
        include: {
            lists: true,
            users: {
                include: {
                    user: true,
                },
            },
            cards: {
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
            },
        },
    });

    if (!board) {
        return res.status(404).json({
            error: {
                message: "Board not found",
                name: "ClientError",
            },
        });
    }

    const activities = await prisma.activity.findMany({
        where: {
            objectType: ActivityObject.CARD,
            objectId: {
                in: board.cards.map((card) => card.id),
            },
        },
        include: {
            user: true,
        },
    });

    const result: GetResult = {
        ...board,
        users: board.users.map(({ user }) => user),
        cards: board.cards.map((card) => ({
            ...card,
            users: card.users.map(({ user }) => user),
            activities: activities.filter((activity) => activity.objectId === card.id),
        })),
    };

    return res.status(200).json({ result });
});

export default router.handler();
