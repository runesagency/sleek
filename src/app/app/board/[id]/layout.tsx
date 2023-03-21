"use client";

import type { BoardCard, BoardList } from "@/app/app/board/[id]/BoardLayoutContext";
import type { MenuOptions } from "@/lib/menu/hooks/use-menu";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { defaultBoardLayoutContextValue, BoardLayoutContext } from "@/app/app/board/[id]/BoardLayoutContext";
import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import TaskModal from "@/components/TaskModal";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";
import { MenuAlignment, MenuAnchor, MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconArrowBackUp, IconFilter, IconPlus } from "@tabler/icons";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

type BoardPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function BoardPageLayout({ children, params: { id } }: BoardPageLayoutProps) {
    const { data, error, isLoading, mutate: setData } = useRequest<ApiMethod.Board.GetResult>(ApiRoutes.Board(id), defaultBoardLayoutContextValue.data);
    const { openMenu, toggleMenu, openSubMenu } = useMenu();
    const router = useRouter();
    const currentSegment = useSelectedLayoutSegment();

    const { projectId, name, users, lists, cards } = data;
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

    const newListMenuOptions: MenuOptions = useMemo(() => {
        return {
            type: MenuVariant.Forms,
            title: "Create New List",
            submitButtonLabel: "Create",
            lists: [
                {
                    id: "title",
                    label: "Title",
                    type: MenuFormVariant.Input,
                    props: {
                        autoFocus: true,
                    },
                },
            ],
            onSubmit: async ({ title }: { title: string }) => {
                const res = await fetch(ApiRoutes.List, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        order: lists.length,
                        boardId: id,
                    }),
                });

                const { result, error }: ApiResult<ApiMethod.List.PostResult> = await res.json();

                if (error) {
                    return toast.error(error.message);
                }

                setLists([...lists, result]);
            },
        };
    }, [id, lists, setLists]);

    const onCreateNewList = useCallback(
        (e: React.MouseEvent) => {
            toggleMenu(e, {
                alignment: MenuAlignment.Center,
                direction: MenuDirection.Bottom,
                anchor: MenuAnchor.Element,
                ...newListMenuOptions,
            });
        },
        [newListMenuOptions, toggleMenu]
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

    const onContextMenu = useCallback(
        (e: React.MouseEvent) => {
            openMenu(e, {
                type: MenuVariant.Context,
                anchor: MenuAnchor.Cursor,
                direction: MenuDirection.Right,
                lists: [
                    {
                        icon: IconPlus,
                        name: "Create New List",
                        onClick() {
                            openSubMenu({
                                ...newListMenuOptions,
                                anchor: MenuAnchor.Cursor,
                            });
                        },
                    },
                ],
            });
        },
        [newListMenuOptions, openMenu, openSubMenu]
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
            <main onContextMenu={onContextMenu} className="box-border flex h-full w-full flex-col">
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
