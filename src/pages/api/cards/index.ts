import type { NextApiRequest, NextApiResponse } from "next";
import type { PageProps } from "@/pages/projects/[id]";

import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const cards: PageProps["cards"] = req.body;

    switch (req.method) {
        case "PATCH": {
            cards.map(async (card) => {
                await prisma.cards.update({
                    where: {
                        id: card.id,
                    },
                    data: {
                        name: card.name,
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
