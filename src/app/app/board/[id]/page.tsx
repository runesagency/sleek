"use client";

import type { Card } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";

import KanbanLayout from "@/components/App/Board/Layout/Kanban";
import TaskModal from "@/components/App/Board/TaskModal";
import AppPageLayout from "@/components/App/Layout/AppPageLayout";
import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import { prisma } from "@/lib/prisma";

import { List } from "@prisma/client";
import { IconArrowBackUp, IconFilter } from "@tabler/icons";
import Link from "next/link";
import { useCallback, useState } from "react";

export type LayoutProps = PageProps & {
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    setLists: React.Dispatch<React.SetStateAction<PageProps["lists"][]>>;
};

export default function BoardViewPage() {
    const boardId = "boardId";
    const [lists, setLists] = useState<PageProps["lists"]>([]);
    const [cards, setCards] = useState<PageProps["cards"]>([]);

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
