import type { Card } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest & { params: Record<string, string> }, NextApiResponse>();

/**
 * GET /api/cards/:id
 * @summary Get a card
 */
router.get(async (req, res) => {
    const { id } = req.params as { id: string };

    const card = await prisma.card.findUnique({
        where: { id },
    });

    if (!card) {
        return res.status(404).send("Card not found");
    }

    return res.status(200).json(card);
});

/**
 * PATCH /api/cards/:id
 * @summary Edit a card data
 * @param {Card} card - A card object with updated data
 */
router.patch(async (req, res) => {
    const { id } = req.params as { id: string };
    const card: Card = req.body;

    await prisma.card.update({
        where: {
            id,
        },
        data: {
            title: card.title,
            description: card.description,
            order: card.order,
            list_id: card.list_id,
            board_id: card.board_id,
            cover_attachment_id: card.cover_attachment_id,
            start_date: card.start_date,
            due_date: card.due_date,
        },
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/:id
 * @summary Delete a card
 */
router.delete(async (req, res) => {
    const { id } = req.params as { id: string };

    await prisma.card.delete({
        where: { id },
    });

    return res.status(200).end();
});

export default router.handler();
