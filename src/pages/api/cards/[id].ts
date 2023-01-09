import type { NextApiRequest, NextApiResponse } from "next";
import type { PageProps } from "@/pages/projects/[id]";

import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };
    const card: PageProps["cards"][0] = req.body;

    switch (req.method) {
        case "PATCH": {
            await prisma.cards.update({
                where: { id },
                data: {
                    name: card.name,
                    description: card.description,
                },
            });

            return res.status(200).end();
        }

        default: {
            return res.status(405).end();
        }
    }
}
