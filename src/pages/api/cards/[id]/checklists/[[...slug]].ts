import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest & { params: Record<string, string> }, NextApiResponse>();

/**
 * POST /api/cards/:id/checklists/:checklistId
 * @summary Connect card to available checklist
 */
router.post("/api/cards/:id/checklists/:title", async (req, res) => {
    const { id, title } = req.params as { id: string; title: string };

    await prisma.card_checklists.create({
        data: {
            card_id: id,
            title,
        },
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/:id/checklists/:checklistId
 * @summary Disconnect a checklist from a card
 */
router.delete("/api/cards/:id/checklists/:checklistId", async (req, res) => {
    const { id, checklistId } = req.params as { id: string; checklistId: string };

    await prisma.card_checklists.deleteMany({
        where: {
            id: checklistId,
            card_id: id,
        },
    });

    return res.status(200).end();
});

export default router.handler();
