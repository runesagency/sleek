import type { GetServerSideProps } from "next";
import type { activities, cards, card_labels, card_users, lists } from "@prisma/client";
import type { ParsedSSRObjectProps } from "@/lib/types";

import { prisma } from "@/lib/prisma";
import { parseSSRArrayProps, parseSSRObjectProps } from "@/lib/utils";
import KanbanLayout from "@/components/BoardLayout/Kanban";

export type PageProps = {
    lists: ParsedSSRObjectProps<lists>[];
    cards: ParsedSSRObjectProps<
        cards & {
            labels: ParsedSSRObjectProps<card_labels>[];
            users: ParsedSSRObjectProps<card_users>[];
            activities: ParsedSSRObjectProps<activities>[];
        }
    >[];
};

export const getServerSideProps: GetServerSideProps = async () => {
    const lists = await prisma.lists.findMany({
        orderBy: {
            order: "asc",
        },
    });

    const cards = await prisma.cards.findMany({
        where: {
            list_id: {
                in: lists.map(({ id }) => id),
            },
        },
        orderBy: {
            order: "asc",
        },
        include: {
            labels: true,
            users: true,
            activities: true,
        },
    });

    return {
        props: {
            lists: parseSSRArrayProps(lists),
            cards: cards.map((card) => ({
                ...parseSSRObjectProps(card),
                labels: parseSSRArrayProps(card.labels),
                users: parseSSRArrayProps(card.users),
                activities: parseSSRArrayProps(card.activities),
            })),
        } as PageProps,
    };
};

export default function BoardPage({ lists, cards }: PageProps) {
    return (
        <main className="relative flex h-screen min-h-screen w-screen flex-col items-center overflow-auto bg-neutral-800 text-white">
            <section className="flex w-full items-center justify-between bg-neutral-900/75 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-8" />

                <div className="flex items-center gap-8">
                    <span className="material-icons-outlined">people</span>
                    <span className="material-icons-outlined">notifications</span>

                    <div className="flex items-center gap-4 rounded-md bg-neutral-700 px-3 py-2">
                        <img src="https://picsum.photos/200" alt="User Image" className="h-7 rounded-full" />
                        <p className="text-sm font-semibold">John Doe</p>
                    </div>
                </div>
            </section>

            <KanbanLayout cards={cards} lists={lists} />
        </main>
    );
}
