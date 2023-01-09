import type { NextApiRequest, NextApiResponse } from "next";
import type { PageProps } from "@/pages/projects/[id]";

import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };
    const card: PageProps["cards"][0] = req.body;

    switch (req.method) {
        case "GET": {
            const card = await prisma.cards.findUnique({
                where: { id },
            });

            if (!card) {
                return res.status(404).send("Card not found");
            }

            return res.status(200).json(card);
        }

        case "PATCH": {
            await prisma.cards.update({
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

            return res.status(200).end();
        }

        case "DELETE": {
            await prisma.cards.delete({
                where: { id },
            });

            return res.status(200).end();
        }

        default: {
            return res.status(405).send("Method not allowed");
        }
    }
}
