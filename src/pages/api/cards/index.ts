import type { NextApiRequest, NextApiResponse } from "next";
import type { PageProps } from "@/pages/projects/[id]";

import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const sourceCards: PageProps["cards"] | PageProps["cards"][0] = req.body;
    const cards = Array.isArray(sourceCards) ? sourceCards : [sourceCards];

    switch (req.method) {
        case "POST": {
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

            if (results.length === 1) {
                return res.status(200).json(await results[0]);
            } else {
                return res.status(200).json(await Promise.all(results));
            }
        }

        case "PATCH": {
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
        }

        default: {
            return res.status(405).end();
        }
    }
}
