import type { NextApiRequest, NextApiResponse } from "next";
import type { Card as CardType } from "@/lib/types";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * GET /api/cards/[id]
 * @summary Get a card
 */
router.get(async (req, res) => {
    const { id } = req.query as { id: string };

    const card = await prisma.cards.findUnique({
        where: { id },
    });

    if (!card) {
        return res.status(404).send("Card not found");
    }

    return res.status(200).json(card);
});

/**
 * PATCH /api/cards/[id]
 * @summary Edit a card data
 * @param {CardType} card - A card object with updated data
 */
router.patch(async (req, res) => {
    const { id } = req.query as { id: string };
    const card: CardType = req.body;

    const newCard = await prisma.cards.update({
        where: { id },
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

    return res.status(200).json(newCard);
});

/**
 * DELETE /api/cards/[id]
 * @summary Delete a card
 */
router.delete(async (req, res) => {
    const { id } = req.query as { id: string };

    await prisma.cards.delete({
        where: { id },
    });

    return res.status(200).end();
});

export default router.handler();
