import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Activity, Attachment, Board, Card, CardAttachment, CardChecklist, CardChecklistTask, CardLabel, CardTimer, Label, List, User } from "@prisma/client";

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
    }

    return res.status(401).end();
});

export type GetResult = Board & {
    users: User[];
    lists: List[];
    cards: (Card & {
        users: User[];
        timers: CardTimer[];
        creator: User;
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
    const boardId = req.query.id as string;

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

    const users = board.users.map(({ user }) => user);

    return res.status(200).json({
        result: {
            ...board,
            users,
            cards: board.cards.map((card) => ({
                ...card,
                users: card.users.map(({ user }) => user),
            })),
        } as GetResult,
    });
});

export default router.handler();
