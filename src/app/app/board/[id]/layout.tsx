"use client";

import type { BoardCard, BoardList } from "@/app/app/board/[id]/BoardLayoutContext";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { defaultBoardLayoutContextValue, BoardLayoutContext } from "@/app/app/board/[id]/BoardLayoutContext";
import { SwitchButton } from "@/components/Forms";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

type BoardPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function BoardPageLayout({ children, params: { id } }: BoardPageLayoutProps) {
    const { data, error, isLoading, mutate: setData } = useRequest<ApiMethod.Board.GetResult>(ApiRoutes.Board(id), defaultBoardLayoutContextValue.data);
    const router = useRouter();
    const currentSegment = useSelectedLayoutSegment();

    const { lists, cards } = data;
    const [activeCard, setActiveCard] = useState<BoardCard | undefined>(undefined);

    const setLists = useCallback(
        (lists: BoardList[]) => {
            setData(
                (prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        lists,
                    };
                },
                {
                    revalidate: false,
                }
            );
        },
        [setData]
    );

    const setCards = useCallback(
        (cards: BoardCard[]) => {
            setData(
                (prev) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        cards,
                    };
                },
                {
                    revalidate: false,
                }
            );
        },
        [setData]
    );

    const onCreateNewCard = useCallback(
        async (name: string, listId: string, order: number) => {
            const parsedName = name.trim();
            if (parsedName === "") return;

            const list = lists.find((list) => list.id === listId);
            if (!list) {
                toast.error("List not found");
                return;
            }

            const requestBody: ApiMethod.Card.PostSchemaType = {
                title: parsedName,
                boardId: id,
                listId,
                order,
            };

            const res = await fetch(ApiRoutes.Card, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const { result, error }: ApiResult<ApiMethod.Card.PostResult> = await res.json();

            if (error) {
                toast.error(error.message);
                return;
            }

            let updatedCards: BoardCard[] = [];
            const otherCards = cards.filter((card) => card.listId !== listId);
            const listCards = cards.filter((card) => card.listId === listId);

            if (order === 0) {
                updatedCards = [
                    ...otherCards, //
                    result,
                    ...listCards.map((card) => ({ ...card, order: card.order + 1 })),
                ];
            } else {
                updatedCards = [
                    ...otherCards, //
                    ...listCards,
                    result,
                ];
            }

            setCards(updatedCards);
        },
        [cards, id, lists, setCards]
    );

    const links = [
        { name: "About", segment: "about" },
        { name: "View", segment: "view" },
        { name: "Members", segment: "members" },
        { name: "Settings", segment: "settings" },
    ];

    if (error) {
        toast.error(error.message);
        return router.push(Routes.App);
    }

    return (
        <BoardLayoutContext.Provider value={{ isLoading, data, activeCard, refreshData: setData, setLists, setCards, setActiveCard, onCreateNewCard }}>
            <main className="flex h-full w-full flex-col">
                <div className="flex bg-dark-700 px-11">
                    {links.map(({ name, segment }, index) => (
                        <Link key={index} href={Routes.Board(id) + "/" + (segment ?? "")}>
                            <SwitchButton active={currentSegment === segment}>{name}</SwitchButton>
                        </Link>
                    ))}
                </div>

                {children}
            </main>
        </BoardLayoutContext.Provider>
    );
}
