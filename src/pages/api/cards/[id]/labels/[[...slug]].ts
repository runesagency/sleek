import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest & { params: Record<string, string> }, NextApiResponse>();

/**
 * POST /api/cards/:id/labels/:labelId
 * @summary Connect a label to a card
 */
router.post("/api/cards/:id/labels/:labelId", async (req, res) => {
    const { id, labelId } = req.params as { id: string; labelId: string };

    await prisma.cardLabel.create({
        data: {
            card_id: id,
            label_id: labelId,
        },
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/:id/labels/:labelId
 * @summary Disconnect a label from a card
 */
router.delete("/api/cards/:id/labels/:labelId", async (req, res) => {
    const { id, labelId } = req.params as { id: string; labelId: string };

    await prisma.cardLabel.deleteMany({
        where: {
            card_id: id,
            label_id: labelId,
        },
    });

    return res.status(200).end();
});

export default router.handler();
