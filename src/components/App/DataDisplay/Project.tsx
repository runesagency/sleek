"use client";

import type { Project as ProjectType } from "@prisma/client";

import { Button } from "@/components/Forms";
import { MenuVariant, MenuAnchor, useMenu, MenuDirection, MenuAlignment } from "@/lib/menu";

import { IconCalendar, IconCards, IconPencil, IconPictureInPicture, IconPlus, IconTrash } from "@tabler/icons";
import Link from "next/link";
import { useCallback } from "react";

const Project = ({ id, name, description }: ProjectType) => {
    const { openMenu } = useMenu();

    const onContextMenu = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            openMenu(e, {
                anchor: MenuAnchor.Cursor,
                type: MenuVariant.Context,
                direction: MenuDirection.Left,
                alignment: MenuAlignment.Start,
                lists: [
                    {
                        name: "Add Members",
                        icon: IconPlus,
                        onClick() {
                            console.log("Add Members");
                        },
                    },
                    {
                        name: "Edit Info",
                        icon: IconPencil,
                        onClick() {
                            console.log("Edit");
                        },
                    },
                    {
                        name: "Edit Cover",
                        icon: IconPictureInPicture,
                        onClick() {
                            console.log("Edit Cover");
                        },
                    },
                    {
                        name: "Set Date",
                        icon: IconCalendar,
                        onClick() {
                            console.log("Set Date");
                        },
                    },
                    {
                        name: "Delete",
                        icon: IconTrash,
                        onClick() {
                            console.log("Delete");
                        },
                    },
                ],
            });
        },
        [openMenu]
    );

    return (
        <Link href={`/app/project/${id}`} onContextMenu={onContextMenu} className="flex flex-col items-start gap-4 rounded-lg border border-dark-500 bg-dark-600 p-4 xl:flex-row">
            <img src="https://picsum.photos/1080" alt="banner" className="h-32 w-full shrink-0 rounded-lg object-cover object-center xl:h-full xl:w-1/3" />

            <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-2">
                    <img src="https://picsum.photos/1080" alt="banner" className="h-6 w-6 shrink-0 rounded-full object-cover object-center" />
                    <h3 className="text-base font-bold">{name}</h3>
                </div>

                <p className="text-xs font-medium line-clamp-2">{description}</p>

                <div className="flex flex-wrap gap-1">
                    <Button.Small fit className="bg-dark-700 text-xs" icon={IconCards}>
                        69 Boards
                    </Button.Small>

                    <Button.Small fit className="bg-dark-700 text-xs" icon={IconCalendar}>
                        12 Jan 2023 - 35 Feb 3069
                    </Button.Small>
                </div>
            </div>
        </Link>
    );
};

export default Project;
