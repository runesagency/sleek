import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * POST /api/cards/[id]/labels
 * @summary Add multiple labels or create new label to a card
 * @param {string[]} labelsId - An array of the `labels` ID
 */
router.post(async (req, res) => {
    const { id } = req.query as { id: string };
    const labelsId: string[] = req.body;

    labelsId.map(async (labelId: string) => {
        await prisma.card_labels.create({
            data: {
                card_id: id,
                label_id: labelId,
            },
        });
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/[id]/labels
 * @summary Delete multiple labels from a card
 * @param {string[]} - An array of the `card_labels` ID
 */
router.delete(async (req, res) => {
    const labelsId: string[] = req.body;

    await prisma.card_labels.deleteMany({
        where: {
            id: {
                in: labelsId,
            },
        },
    });

    return res.status(200).end();
});

export default router.handler();
