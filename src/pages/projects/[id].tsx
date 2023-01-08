import type { GetServerSideProps } from "next";
import type { activities, cards, card_attachments, card_checklists, card_checklist_tasks, card_labels, card_users, labels, lists, users } from "@prisma/client";
import type { ParsedSSRProps } from "@/lib/utils";

import { prisma } from "@/lib/prisma";
import KanbanLayout from "@/components/Board/Layout/Kanban";
import TaskModal from "@/components/Board/TaskModal";
import { parseSSRProps } from "@/lib/utils";

import { IconBell, IconUsers } from "@tabler/icons";
import { useState } from "react";

export type PageProps = {
    boardId: string;
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

export type LayoutProps = PageProps & {
    setCards: React.Dispatch<React.SetStateAction<PageProps["cards"]>>;
    setLists: React.Dispatch<React.SetStateAction<PageProps["lists"]>>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
    const boardId = "f34ad9e7-c676-47bb-a27c-ebdc127d4694";

    const lists = await prisma.lists.findMany({
        orderBy: {
            order: "asc",
        },
        where: {
            board_id: boardId,
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
            boardId,
            lists: parseSSRProps(lists),
            cards: parseSSRProps(cards),
        },
    };
};

export default function BoardPage({ lists: originalLists, cards: originalCards, boardId }: PageProps) {
    const [lists, setLists] = useState<PageProps["lists"]>(originalLists);
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards);

    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <section className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-6" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </section>

            <TaskModal />
            <KanbanLayout cards={cards} lists={lists} boardId={boardId} setCards={setCards} setLists={setLists} />
        </main>
    );
}
