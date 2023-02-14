import type { Card as CardType } from "@/lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest & { params: Record<string, string> }, NextApiResponse>();

/**
 * POST /api/cards
 * @summary Create a single or multiple cards
 * @param {CardType | CardType[]} cards - A card or an array of cards object
 */
router.post(async (req, res) => {
    const sourceCards: CardType[] | CardType = req.body;
    const cards = Array.isArray(sourceCards) ? sourceCards : [sourceCards];

    const results = cards.map(async (card) => {
        return await prisma.cards.create({
            data: {
                title: card.title,
                description: card.description,
                list_id: card.list_id,
                board_id: card.board_id,
                order: card.order,
                cover_attachment_id: card.cover_attachment_id,
                start_date: card.start_date,
                due_date: card.due_date,
            },
            include: {
                labels: {
                    include: {
                        label: true,
                    },
                },
                users: {
                    include: {
                        user: true,
                    },
                },
                attachments: {
                    include: {
                        attachment: true,
                    },
                },
                cover: true,
                checklists: {
                    include: {
                        tasks: {
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
                creator: true,
                timers: true,
            },
        });
    });

    return res.status(200).json(results.length === 1 ? await results[0] : await Promise.all(results));
});

/**
 * PATCH /api/cards
 * @summary Edit multiple cards data
 * @param {CardType[]} cards - An array of cards object with updated data
 */
router.patch(async (req, res) => {
    const cards: CardType[] = req.body;

    cards.map(async (card) => {
        await prisma.cards.update({
            where: {
                id: card.id,
            },
            data: {
                title: card.title,
                description: card.description,
                order: card.order,
                list_id: card.list_id,
            },
        });
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards
 * @summary Delete multiple cards
 */
router.delete(async (req, res) => {
    const cards: CardType[] = req.body;

    await prisma.cards.deleteMany({
        where: {
            id: {
                in: cards.map((card) => card.id),
            },
        },
    });

    return res.status(200).end();
});

export default router.handler();
