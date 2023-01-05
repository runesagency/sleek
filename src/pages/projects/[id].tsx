import type { GetServerSideProps } from "next";
import type { activities, cards, card_attachments, card_checklists, card_checklist_tasks, card_labels, card_users, labels, lists, users } from "@prisma/client";
import type { ParsedSSRProps } from "@/lib/utils";

import { prisma } from "@/lib/prisma";
import KanbanLayout from "@/components/Board/Layout/Kanban";
import TaskModal from "@/components/Board/TaskModal";
import { parseSSRProps } from "@/lib/utils";

import { IconBell, IconUsers } from "@tabler/icons";

export type PageProps = {
    lists: ParsedSSRProps<lists[]>;
    cards: ParsedSSRProps<
        (cards & {
            labels: (card_labels & {
                label: labels | null;
            })[];
            users: (card_users & {
                user: users | null;
            })[];
            activities: activities[];
            attachments: card_attachments[];
            cover: card_attachments | null;
            checklists: (card_checklists & {
                tasks: card_checklist_tasks[];
            })[];
        })[]
    >;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
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
            cover: true,
            checklists: {
                include: {
                    tasks: true,
                },
            },
        },
    });

    return {
        props: {
            lists: parseSSRProps(lists),
            cards: parseSSRProps(cards),
        },
    };
};

export default function BoardPage({ lists, cards }: PageProps) {
    return (
        <main className="relative flex h-screen max-h-screen min-h-screen w-screen flex-col items-center overflow-auto bg-dark-900 text-dark-50">
            <section className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-6" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </section>

            <KanbanLayout cards={cards} lists={lists} />
            <TaskModal />
        </main>
    );
}
