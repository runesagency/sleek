import type { CardTimer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest & { params: Record<string, string> }, NextApiResponse>();

/**
 * POST /api/cards/:id/timers
 * @summary Create a new timer for the card
 */
router.post("/api/cards/:id/timers", async (req, res) => {
    const { id } = req.params as { id: string };

    await prisma.cardTimer.create({
        data: {
            card_id: id,
        },
    });

    return res.status(200).end();
});

/**
 * PATCH /api/cards/:id/timers/:timerId
 * @summary Edit a timer of the card
 * @param {CardTimer} timer - The timer to edit
 */
router.patch("/api/cards/:id/timers/:timerId", async (req, res) => {
    const { id, timerId } = req.params as { id: string; timerId: string };
    const body: CardTimer = req.body;

    await prisma.cardTimer.updateMany({
        data: body,
        where: {
            id: timerId,
            card_id: id,
        },
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/:id/timers/:timerId
 * @summary Delete a timer of the card
 * @param {string} timerId - The timer id
 */
router.delete("/api/cards/:id/timers/:timerId", async (req, res) => {
    const { id, timerId } = req.params as { id: string; timerId: string };

    await prisma.cardTimer.deleteMany({
        where: {
            id: timerId,
            card_id: id,
        },
    });

    return res.status(200).end();
});

export default router.handler();
