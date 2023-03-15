"use client";

import type { ApiMethod, ApiResult } from "@/lib/types";

import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import TaskModal from "@/components/TaskModal";
import { ApiRoutes, Routes } from "@/lib/constants";

import { IconArrowBackUp, IconFilter, IconPlus } from "@tabler/icons";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type BoardList = ApiMethod.Board.GetResult["lists"][0];

export type BoardCard = ApiMethod.Board.GetResult["cards"][0];

type BoardLayoutContextProps = {
    isLoading: boolean;
    activeCard?: BoardCard;
    data: ApiMethod.Board.GetResult;
    setLists: (lists: BoardList[]) => void;
    setCards: (cards: BoardCard[]) => void;
    setActiveCard: (card: BoardCard | undefined) => void;
    onCreateNewCard: (name: string, listId: string, order: number) => Promise<void>;
};

const defaultContextValue: BoardLayoutContextProps = {
    isLoading: true,
    data: {
        id: "",
        createdAt: new Date(),
        creatorId: "",
        description: "",
        locked: false,
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        password: "",
        projectId: "",
        users: [],
        lists: [],
        cards: [],
    },
    activeCard: undefined,
    setLists: () => {
        throw new Error("setLists is not defined");
    },
    setCards: () => {
        throw new Error("setCards is not defined");
    },
    setActiveCard: () => {
        throw new Error("setActiveCard is not defined");
    },
    onCreateNewCard: () => {
        throw new Error("onCreateNewCard is not defined");
    },
};

export const BoardLayoutContext = createContext<BoardLayoutContextProps>(defaultContextValue);

type BoardPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function BoardPageLayout({ children, params: { id } }: BoardPageLayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<BoardLayoutContextProps["data"]>(defaultContextValue.data);
    const [activeCard, setActiveCard] = useState<BoardCard | undefined>(undefined);

    const router = useRouter();
    const { projectId, name, users, lists, cards } = data;

    const setLists = useCallback((lists: BoardList[]) => {
        setData((prev) => ({
            ...prev,
            lists,
        }));
    }, []);

    const setCards = useCallback((cards: BoardCard[]) => {
        setData((prev) => ({
            ...prev,
            cards,
        }));
    }, []);

    const onCreateNewList = useCallback(() => {
        fetch(ApiRoutes.List, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "New List",
                order: lists.length,
            }),
        }).then(async (res) => {
            const { result, error }: ApiResult<ApiMethod.List.PostResult> = await res.json();

            if (error) {
                return toast.error(error.message);
            }

            setLists([...lists, result]);
        });
    }, [lists, setLists]);

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

    const currentSegment = useSelectedLayoutSegment();

    const links = [
        { name: "About", segment: "about" },
        { name: "View", segment: "view" },
        { name: "Members", segment: "members" },
        { name: "Settings", segment: "settings" },
    ];

    useEffect(() => {
        fetch(ApiRoutes.Board(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (res) => {
            const { result, error }: ApiResult<ApiMethod.Board.GetResult> = await res.json();

            if (error) {
                toast.error(error.message);
                return router.push(Routes.App);
            }

            setIsLoading(false);
            setData(result);
        });
    }, [id, router]);

    return (
        <BoardLayoutContext.Provider value={{ isLoading, data, activeCard, setLists, setCards, setActiveCard, onCreateNewCard }}>
            <main className="box-border flex h-full w-full flex-col">
                <div className="flex bg-dark-700 px-11">
                    {links.map(({ name, segment }, index) => (
                        <Link key={index} href={Routes.Board(id) + "/" + (segment ?? "")}>
                            <SwitchButton active={currentSegment === segment}>{name}</SwitchButton>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6 px-11 py-6">
                    {isLoading ? (
                        <>
                            <div className="animate-shimmer h-10 w-40 shrink-0 rounded-lg bg-dark-700" />
                            <div className="animate-shimmer h-10 w-64 shrink-0 rounded-lg bg-dark-700" />
                            <div className="animate-shimmer h-10 w-20 shrink-0 rounded-lg bg-dark-700" />
                        </>
                    ) : (
                        <>
                            <Link href={Routes.Project(projectId)}>
                                <Button.Small icon={IconArrowBackUp} fit>
                                    Back
                                </Button.Small>
                            </Link>

                            <h2 className="ts-2xl">{name}</h2>

                            <MemberList.Large users={users} />

                            <Button.Large icon={IconFilter} fit>
                                Filter
                            </Button.Large>

                            <Button.Large icon={IconPlus} fit onClick={onCreateNewList}>
                                Create New List
                            </Button.Large>
                        </>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-full w-full px-11 pb-6">
                        <div className="animate-shimmer h-full w-full shrink-0 rounded-lg bg-dark-700" />
                    </div>
                ) : (
                    children
                )}

                <TaskModal />
            </main>
        </BoardLayoutContext.Provider>
    );
}
