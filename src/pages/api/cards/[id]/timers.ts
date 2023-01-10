import type { NextApiRequest, NextApiResponse } from "next";
import type { card_timers as CardTimer } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * POST /api/cards/[id]/timers
 * @summary Create a new timer for the card
 */
router.post(async (req, res) => {
    const { id } = req.query as { id: string };

    await prisma.card_timers.create({
        data: {
            card_id: id,
        },
    });

    return res.status(200).end();
});

/**
 * PATCH /api/cards/[id]/timers
 * @summary Edit a timer of the card
 * @param {CardTimer} timer - The timer to edit
 */
router.patch(async (req, res) => {
    const timer: CardTimer = req.body;

    await prisma.card_timers.update({
        data: timer,
        where: {
            id: timer.id,
        },
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/[id]/timers
 * @summary Delete a timer of the card
 * @param {string} timerId - The timer id
 */
router.delete(async (req, res) => {
    const { timerId } = req.body;

    await prisma.card_timers.delete({
        where: {
            id: timerId,
        },
    });

    return res.status(200).end();
});

export default router;
