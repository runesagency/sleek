import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * POST /api/cards/[id]/users
 * @summary Add multiple user to card
 * @param {string[]} usersId - An array of the `users` ID
 */
router.post(async (req, res) => {
    const { id } = req.query as { id: string };
    const usersId: string[] = req.body;

    usersId.map(async (userId) => {
        await prisma.card_users.create({
            data: {
                user_id: userId,
                card_id: id,
            },
        });
    });

    return res.status(200).end();
});

/**
 * DELETE /api/cards/[id]/users
 * @summary Delete multiple user from a card
 * @param {string[]} usersId - An array of the user ids
 */
router.delete(async (req, res) => {
    const usersId: string[] = req.body;

    await prisma.card_users.deleteMany({
        where: {
            id: {
                in: usersId,
            },
        },
    });

    return res.status(200).end();
});

export default router.handler();
