import type { GetServerSideProps } from "next";
import type { activities, cards, card_attachments, card_labels, card_users, labels, lists, users } from "@prisma/client";
import type { ParsedSSRObjectProps } from "@/lib/types";

import { prisma } from "@/lib/prisma";
import { parseSSRArrayProps, parseSSRObjectProps } from "@/lib/utils";
import KanbanLayout from "@/components/BoardLayout/Kanban";

import { IconBell, IconUser, IconUsers } from "@tabler/icons";

export type PageProps = {
    lists: ParsedSSRObjectProps<lists>[];
    cards: ParsedSSRObjectProps<
        cards & {
            labels: ParsedSSRObjectProps<
                card_labels & {
                    label: ParsedSSRObjectProps<labels>;
                }
            >[];
            users: ParsedSSRObjectProps<
                card_users & {
                    user: ParsedSSRObjectProps<users>;
                }
            >[];
            activities: ParsedSSRObjectProps<activities>[];
            attachments: ParsedSSRObjectProps<card_attachments>[];
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
            activities: true,
            attachments: true,
        },
    });

    return {
        props: {
            lists: parseSSRArrayProps(lists),
            cards: cards.map((card) => ({
                ...parseSSRObjectProps(card),
                activities: parseSSRArrayProps(card.activities),
                attachments: parseSSRArrayProps(card.attachments),
                labels: card.labels.map((label) => ({
                    ...parseSSRObjectProps(label),
                    label: label.label ? parseSSRObjectProps(label.label) : null,
                })),
                users: card.users.map((user) => ({
                    ...parseSSRObjectProps(user),
                    user: user.user ? parseSSRObjectProps(user.user) : null,
                })),
            })),
        } as PageProps,
    };
};

export default function BoardPage({ lists, cards }: PageProps) {
    return (
        <main className="relative flex h-screen min-h-screen w-screen flex-col items-center overflow-auto bg-dark-800 text-white">
            <section className="flex w-full items-center justify-between bg-dark-900/75 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-8" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />

                    <div className="flex items-center gap-4 rounded-md bg-dark-700 px-3 py-2">
                        <img src="https://picsum.photos/200" alt="User Image" className="h-7 rounded-full" />
                        <p className="text-sm font-semibold">John Doe</p>
                    </div>
                </div>
            </section>

            <KanbanLayout cards={cards} lists={lists} />
        </main>
    );
}
