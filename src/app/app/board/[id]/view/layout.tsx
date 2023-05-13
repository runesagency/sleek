"use client";

import type { MenuOptions } from "@/lib/menu/hooks/use-menu";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { BoardLayoutContext } from "@/app/app/board/[id]/BoardLayoutContext";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";
import TaskModal from "@/components/TaskModal";
import { ApiRoutes, Routes } from "@/lib/constants";
import { MenuAlignment, MenuAnchor, MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconArrowBackUp, IconFilter, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useContext, useMemo } from "react";
import { toast } from "react-toastify";

type BoardViewPageLayoutProps = {
    children: React.ReactNode;
};

export default function BoardViewPageLayout({ children }: BoardViewPageLayoutProps) {
    const {
        data: { id: boardId, projectId, name, users, lists },
        isLoading,
        setLists,
    } = useContext(BoardLayoutContext);

    const { openMenu, toggleMenu, openSubMenu } = useMenu();

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
                const res = await fetch(ApiRoutes.ListCollections, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        order: lists.length,
                        boardId,
                    }),
                });

                const { result, error }: ApiResult<ApiMethod.ListCollections.PostResult> = await res.json();

                if (error) {
                    return toast.error(error.message);
                }

                setLists([...lists, result]);
            },
        };
    }, [boardId, lists, setLists]);

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

    return (
        <main onContextMenu={onContextMenu} className="flex h-full w-full flex-col">
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

                        <MemberList.Large users={users} min={5} max={7} />

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
    );
}
