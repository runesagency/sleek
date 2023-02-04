import type { Card as CardType, List as ListType } from "@/lib/types";
import type { GetServerSideProps } from "next";

import KanbanLayout from "@/components/App/Board/Layout/Kanban";
import TaskModal from "@/components/App/Board/TaskModal";
import AppPageLayout from "@/components/App/Layout/AppPageLayout";
import MemberList from "@/components/DataDisplay/MemberList";
import Button from "@/components/Forms/Button";
import SwitchButton from "@/components/Forms/SwitchButton";
import { prisma } from "@/lib/prisma";
import { parseSSRProps } from "@/lib/utils/parse-ssr-props";

import { IconFilter } from "@tabler/icons";
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
            attachments: {
                include: {
                    attachment: true,
                },
            },
            cover: true,
            creator: true,
            timers: true,
            checklists: {
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
    });

    const activities = await prisma.activities.findMany({
        where: {
            object_type: {
                in: ["CARD"],
            },
            object_id: {
                in: [...cards.map(({ id }) => id)],
            },
        },
        include: {
            user: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return {
        props: {
            boardId,
            lists: parseSSRProps(lists),
            cards: parseSSRProps(
                cards.map((card) => ({
                    ...card,
                    activities: activities.filter(({ object_id }) => object_id === card.id),
                }))
            ),
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
        <AppPageLayout useSidebar={false} className="box-border flex h-full w-full flex-col">
            <div className="flex bg-dark-700 px-11">
                <SwitchButton>Board 01</SwitchButton>
                <SwitchButton>Board 02</SwitchButton>
                <SwitchButton active>Board 03</SwitchButton>
            </div>

            <div className="flex items-center gap-6 px-11 py-6">
                <h2 className="ts-2xl">Project 001</h2>

                <MemberList.Large users={cards[0].users.map(({ user }) => user)} />

                <Button.Large icon={IconFilter} fit>
                    Filter
                </Button.Large>
            </div>

            <KanbanLayout cards={cards} lists={lists} boardId={boardId} setCards={setCards} setLists={setLists} />

            {/* Absolute */}
            <TaskModal cards={cards} onUpdate={onCardUpdate} />
        </AppPageLayout>
    );
}
