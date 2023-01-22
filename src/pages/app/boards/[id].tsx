import type { Card as CardType, List as ListType } from "@/lib/types";
import type { GetServerSideProps } from "next";

import KanbanLayout from "@/components/Board/Layout/Kanban";
import TaskModal from "@/components/Board/TaskModal";
import { prisma } from "@/lib/prisma";
import { parseSSRProps } from "@/lib/utils/parse-ssr-props";

import { IconBell, IconUsers } from "@tabler/icons";
import { useCallback, useState } from "react";

export type PageProps = {
    boardId: string;
    cards: CardType[];
    lists: ListType[];
};

export type LayoutProps = PageProps & {
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
    setLists: React.Dispatch<React.SetStateAction<ListType[]>>;
};

export const getServerSideProps: GetServerSideProps<PageProps | { [key: string]: unknown }> = async ({ query }) => {
    const boardId = query.id as string;

    const board = await prisma.boards.findUnique({
        where: {
            id: boardId,
        },
    });

    if (!board) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
            props: {},
        };
    }

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
            board_id: boardId,
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
            creator: true,
            timers: true,
            checklists: {
                include: {
                    checklist: {
                        include: {
                            tasks: {
                                include: {
                                    users: {
                                        include: {
                                            user: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
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
    const [cards, setCards] = useState<CardType[]>(originalCards);

    const onCardUpdate = useCallback(
        async (card: CardType) => {
            const foundCardIndex = cards.findIndex(({ id }) => id === card.id);

            if (foundCardIndex === -1) return;

            const updatedCards = [...cards];
            updatedCards[foundCardIndex] = card;

            setCards(updatedCards);

            await fetch(`/api/cards/${card.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(card),
            });
        },
        [cards]
    );

    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <section className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-6" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </section>

            <KanbanLayout cards={cards} lists={lists} boardId={boardId} setCards={setCards} setLists={setLists} />
            <TaskModal cards={cards} onUpdate={onCardUpdate} />
        </main>
    );
}
