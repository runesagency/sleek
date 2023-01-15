import type { Card as CardType } from "@/lib/types";
import type { card_timers as CardTimer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

import { createRouter } from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

/**
 * POST /api/cards
 * @summary Create a single or multiple cards
 * @param {CardType | CardType[]} cards - A card or an array of cards object
 */
router.post("/api/cards", async (req, res) => {
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
                activities: {
                    include: {
                        user: true,
                    },
                },
                attachments: {
                    include: {
                        attachment: true,
                    },
                },
                cover: {
                    include: {
                        attachment: true,
                    },
                },
                checklists: {
                    include: {
                        checklist: {
                            include: {
                                tasks: true,
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
router.patch("/api/cards", async (req, res) => {
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
router.delete("/api/cards", async (req, res) => {
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

/**
 * GET /api/cards/:id
 * @summary Get a card
 */
router.get("/api/cards/:id", async (req, res) => {
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
 * PATCH /api/cards/:id
 * @summary Edit a card data
 * @param {CardType} card - A card object with updated data
 */
router.patch("/api/cards/:id", async (req, res) => {
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
 * DELETE /api/cards/:id
 * @summary Delete a card
 */
router.delete("/api/cards/:id", async (req, res) => {
    const { id } = req.query as { id: string };

    await prisma.cards.delete({
        where: { id },
    });

    return res.status(200).end();
});

/**
 * POST /api/cards/:id/checklists
 * @summary Create a new checklist or connect to available checklist
 * @param {string} - `checklist` ID
 */
router.post("/api/cards/:id/checklists", async (req, res) => {
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
 * DELETE /api/cards/:id/checklists
 * @summary Delete a checklist from a card
 * @param {string} - `card_checklist` ID
 */
router.delete("/api/cards/:id/checklists", async (req, res) => {
    const cardChecklistId: string = req.body;

    const updatedCard = await prisma.card_checklists.delete({
        where: {
            id: cardChecklistId,
        },
    });

    return res.status(200).json(updatedCard);
});

/**
 * POST /api/cards/:id/labels
 * @summary Add multiple labels or create new label to a card
 * @param {string[]} labelsId - An array of the `labels` ID
 */
router.post("/api/cards/:id/labels", async (req, res) => {
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
 * DELETE /api/cards/:id/labels
 * @summary Delete multiple labels from a card
 * @param {string[]} - An array of the `card_labels` ID
 */
router.delete("/api/cards/:id/labels", async (req, res) => {
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

/**
 * POST /api/cards/:id/timers
 * @summary Create a new timer for the card
 */
router.post("/api/cards/:id/timers", async (req, res) => {
    const { id } = req.query as { id: string };

    await prisma.card_timers.create({
        data: {
            card_id: id,
        },
    });

    return res.status(200).end();
});

/**
 * PATCH /api/cards/:id/timers
 * @summary Edit a timer of the card
 * @param {CardTimer} timer - The timer to edit
 */
router.patch("/api/cards/:id/timers", async (req, res) => {
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
 * DELETE /api/cards/:id/timers
 * @summary Delete a timer of the card
 * @param {string} timerId - The timer id
 */
router.delete("/api/cards/:id/timers", async (req, res) => {
    const { timerId } = req.body;

    await prisma.card_timers.delete({
        where: {
            id: timerId,
        },
    });

    return res.status(200).end();
});

/**
 * POST /api/cards/:id/users
 * @summary Add multiple user to card
 * @param {string[]} usersId - An array of the `users` ID
 */
router.post("/api/cards/:id/users", async (req, res) => {
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
 * DELETE /api/cards/:id/users
 * @summary Delete multiple user from a card
 * @param {string[]} usersId - An array of the user ids
 */
router.delete("/api/cards/:id/users", async (req, res) => {
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
