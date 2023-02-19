import type { GetServerSidePropsContext } from "next";

import KanbanLayout from "@/components/App/Board/Layout/Kanban";
import TaskModal from "@/components/App/Board/TaskModal";
import AppPageLayout from "@/components/App/Layout/AppPageLayout";
import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import { prisma } from "@/lib/prisma";

import { IconArrowBackUp, IconFilter } from "@tabler/icons";
import Link from "next/link";
import { useCallback, useState } from "react";

type RequiredProperty<T> = { [P in keyof T]: Required<NonNullable<T[P]>> };

export type PageProps = {
    boardId: string;
    cards: RequiredProperty<Awaited<ReturnType<typeof getServerSideProps>>["props"]["cards"]>;
    lists: RequiredProperty<Awaited<ReturnType<typeof getServerSideProps>>["props"]["lists"]>;
};

export type LayoutProps = PageProps & {
    setCards: React.Dispatch<React.SetStateAction<PageProps["cards"][]>>;
    setLists: React.Dispatch<React.SetStateAction<PageProps["lists"][]>>;
};

export const getServerSideProps = async ({ query }: GetServerSidePropsContext) => {
    const boardId = query.id as string;

    const board = await prisma.board.findUnique({
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

    const lists = await prisma.list.findMany({
        orderBy: {
            order: "asc",
        },
        where: {
            board_id: boardId,
        },
    });

    const cards = await prisma.card.findMany({
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

    const activities = await prisma.activity.findMany({
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
            lists: lists,
            cards: cards.map((card) => ({
                ...card,
                activities: activities.filter(({ object_id }) => object_id === card.id),
            })),
        },
    };
};

export default function BoardViewPage({ lists: originalLists, cards: originalCards, boardId }: PageProps) {
    const [lists, setLists] = useState<PageProps["lists"]>(originalLists);
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards);

    const onCardUpdate = useCallback(
        async (card: PageProps["cards"]) => {
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
                <SwitchButton>About</SwitchButton>
                <SwitchButton active>View</SwitchButton>
                <SwitchButton>Members</SwitchButton>
                <SwitchButton>Settings</SwitchButton>
            </div>

            <div className="flex items-center gap-6 px-11 py-6">
                <Link href={`/app/project/${"projectId"}`}>
                    <Button.Small icon={IconArrowBackUp} fit>
                        Back
                    </Button.Small>
                </Link>

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
