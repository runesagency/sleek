"use client";

import type { MenuOptions } from "@/lib/menu/hooks/use-menu";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { ProjectLayoutContext } from "@/app/app/project/[id]/layout";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";
import { ApiRoutes, Routes } from "@/lib/constants";
import { MenuAnchor, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IconFilter, IconPlus, IconShare } from "@tabler/icons";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

export default function ProjectBoardListPage() {
    const { openMenu, openSubMenu, toggleMenu } = useMenu();
    const [autoAnimateRef] = useAutoAnimate();
    const [boardOnCreate, setBoardOnCreate] = useState<string | null>(null);

    const { isLoading, data, setData } = useContext(ProjectLayoutContext);
    const { users, boards, id } = data;

    const newBoardMenuOptions: MenuOptions = {
        type: MenuVariant.Forms,
        title: "Create New Board",
        lists: [
            {
                id: "name",
                label: "Board Name",
                type: MenuFormVariant.Input,
            },
        ],
        onSubmit({ name }: { name: string }) {
            if (!name) return;

            setBoardOnCreate(name);

            fetch(ApiRoutes.BoardList, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    projectId: id,
                }),
            }).then(async (res) => {
                const { result, error }: ApiResult<ApiMethod.BoardList.PostResult> = await res.json();

                if (error) {
                    return toast.error(error.message);
                }

                setData({
                    ...data,
                    boards: [result, ...boards],
                });

                setBoardOnCreate(null);
            });
        },
    };

    const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        openMenu(e, {
            type: MenuVariant.Context,
            anchor: MenuAnchor.Cursor,
            lists: [
                {
                    icon: IconPlus,
                    name: "Create New Board",
                    onClick: () => {
                        openSubMenu({
                            ...newBoardMenuOptions,
                            anchor: MenuAnchor.Cursor,
                        });
                    },
                },
            ],
        });
    };

    const onCreateNewProject = (e: React.MouseEvent<HTMLButtonElement>) => {
        toggleMenu(e, newBoardMenuOptions);
    };

    return (
        <main className="flex h-full flex-col gap-6" onContextMenu={onContextMenu}>
            <div className="flex items-center gap-5">
                <MemberList.Large users={users} max={5} min={5} />

                <Button.Large icon={IconPlus} fit onClick={onCreateNewProject}>
                    Create New Board
                </Button.Large>

                <Button.Large icon={IconFilter} fit>
                    Filter
                </Button.Large>

                <Button.Large icon={IconShare} fit>
                    Share
                </Button.Large>
            </div>

            <div ref={autoAnimateRef} className="grid grid-cols-4 gap-5">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="animate-shimmer h-40 w-full rounded-lg bg-dark-800" />)
                ) : (
                    <>
                        {boardOnCreate && (
                            <div className="animate-shimmer flex flex-col overflow-hidden rounded-lg">
                                <div className="relative h-40 w-full bg-dark-500">
                                    <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent to-dark-600" />
                                </div>

                                <div className="flex flex-col gap-1 bg-dark-600 p-3">
                                    <h3 className="ts-base">{boardOnCreate}</h3>
                                </div>
                            </div>
                        )}

                        {boards.map(({ id, name, description }, index) => (
                            <Link key={index} href={Routes.Board(id)} className="flex flex-col overflow-hidden rounded-lg">
                                <div className="relative h-40 w-full">
                                    <img src="https://picsum.photos/500" alt="bg" className="z-10 h-full w-full object-cover object-center" />
                                    <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent to-dark-600" />
                                </div>

                                <div className="flex flex-col gap-1 bg-dark-600 p-3">
                                    <h3 className="ts-base">{name}</h3>
                                    {description && <p className="ts-xs">{description}</p>}
                                </div>
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </main>
    );
}
