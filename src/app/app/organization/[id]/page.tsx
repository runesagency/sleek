"use client";

import type { MenuOptions } from "@/lib/menu/hooks/use-menu";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { OrganizationLayoutContext } from "@/app/app/organization/[id]/OrganizationLayoutContext";
import { Button } from "@/components/Forms";
import { ApiRoutes, Routes } from "@/lib/constants";
import { MenuAlignment, MenuAnchor, MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Project } from "@prisma/client";
import { IconCalendar, IconLoader2, IconPencil, IconPictureInPicture, IconPlus, IconTrash, IconCards } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

type ProjectProps = Project & {
    _count: {
        boards: number;
    };
};

const Project = ({ id, name, description, coverAttachmentId, logoAttachmentId, _count: { boards: boardsCount } }: ProjectProps) => {
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
        <Link href={Routes.Project(id)} onContextMenu={onContextMenu} className="flex flex-col items-start gap-4 rounded-lg border border-dark-500 bg-dark-600 p-4 xl:flex-row">
            {coverAttachmentId && <img src="https://picsum.photos/1080" alt="banner" className="h-32 w-full shrink-0 rounded-lg object-cover object-center xl:h-full xl:w-1/3" />}

            <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-2">
                    {logoAttachmentId && <img src="https://picsum.photos/1080" alt="banner" className="h-6 w-6 shrink-0 rounded-full object-cover object-center" />}
                    <h3 className="ts-base font-bold">{name}</h3>
                </div>

                <p className="ts-xs font-medium line-clamp-2">{description || "No description available"}</p>

                <div className="flex flex-wrap gap-1">
                    <Button.Small fit className="ts-xs bg-dark-700" icon={IconCards}>
                        {boardsCount} Boards
                    </Button.Small>
                </div>
            </div>
        </Link>
    );
};

export default function OrganizationProjectListPage() {
    const { openMenu, openSubMenu, toggleMenu } = useMenu();
    const [autoAnimateRef] = useAutoAnimate();
    const [projectOnCreate, setProjectOnCreate] = useState<string | null>(null);

    const { isLoading, data, setData } = useContext(OrganizationLayoutContext);
    const { projects, id } = data;

    const newProjectMenuOptions: MenuOptions = {
        type: MenuVariant.Forms,
        title: "Create New Project",
        lists: [
            {
                id: "name",
                label: "Project Title",
                type: MenuFormVariant.Input,
            },
        ],
        onSubmit({ name }: { name: string }) {
            if (!name) return;

            setProjectOnCreate(name);

            fetch(ApiRoutes.ProjectCollections, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    organizationId: id,
                }),
            }).then(async (res) => {
                const { result, error }: ApiResult<ApiMethod.ProjectCollections.PostResult> = await res.json();

                if (error) {
                    return toast.error(error.message);
                }

                setData({
                    ...data,
                    projects: [result, ...projects],
                });

                setProjectOnCreate(null);
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
                    name: "Create New Project",
                    onClick: () => {
                        openSubMenu({
                            ...newProjectMenuOptions,
                            anchor: MenuAnchor.Cursor,
                        });
                    },
                },
            ],
        });
    };

    const onCreateNewProject = (e: React.MouseEvent<HTMLButtonElement>) => {
        toggleMenu(e, newProjectMenuOptions);
    };

    return (
        <main className="flex h-full flex-col gap-10" onContextMenu={onContextMenu}>
            {/* Folders (Future Development) */}
            {/* {!isLoading && (
                <div className="flex flex-wrap gap-5">
                    <button className="flex items-center gap-4 truncate rounded-lg border border-dark-500 bg-dark-600 px-5 py-4">
                        <IconFolder height={20} width={undefined} />
                        <span>Folder Name</span>
                    </button>
                </div>
            )} */}

            {/* Project List */}
            <div ref={autoAnimateRef} className="grid grid-cols-3 gap-5">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="animate-shimmer h-32 w-full rounded-lg bg-dark-800" />)
                ) : (
                    <>
                        {projectOnCreate && (
                            <button className="animate-shimmer flex flex-col items-start gap-4 rounded-lg border border-dark-600 bg-dark-700 p-4 xl:flex-row">
                                <div className="animate-shimmer h-32 w-full shrink-0 rounded-lg bg-dark-600 object-cover object-center xl:h-full xl:w-1/3" />

                                <div className="flex flex-col gap-4 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <IconLoader2 className="h-5 w-5 shrink-0 animate-spin rounded-full object-cover object-center" />
                                        <h3 className="ts-base font-bold">Creating {projectOnCreate}...</h3>
                                    </div>
                                </div>
                            </button>
                        )}

                        {projects.map((project) => (
                            <Project key={project.id} {...project} />
                        ))}

                        <button onClick={onCreateNewProject} className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-dark-700/50 p-4 duration-200 hover:bg-dark-700/100">
                            <IconPlus height={40} />
                            <span className="ts-base">Create New Project</span>
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}
