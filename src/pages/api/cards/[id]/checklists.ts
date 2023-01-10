import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * POST /api/cards/[id]/checklists
 * @summary Create a new checklist or connect to available checklist
 * @param {string} - `checklist` ID
 */
router.post(async (req, res) => {
    const { id } = req.query as { id: string };
    const checklistId: string = req.body;

    const updatedCard = await prisma.card_checklists.create({
        data: {
            card_id: id,
            checklist_id: checklistId,
        },
    });

    return res.status(200).json(updatedCard);
});

/**
 * DELETE /api/cards/[id]/checklists
 * @summary Delete a checklist from a card
 * @param {string} - `card_checklist` ID
 */
router.delete(async (req, res) => {
    const cardChecklistId: string = req.body;

    const updatedCard = await prisma.card_checklists.delete({
        where: {
            id: cardChecklistId,
        },
    });

    return res.status(200).json(updatedCard);
});

export default router;
