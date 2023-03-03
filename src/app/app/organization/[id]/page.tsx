"use client";

import type { MenuOptions } from "@/lib/menu/hooks/use-menu";

import { OrganizationLayoutContext } from "@/app/app/organization/[id]/layout";
import Project from "@/components/App/DataDisplay/Project";
import { MenuAnchor, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconPlus } from "@tabler/icons";
import { useContext } from "react";

export default function OrganizationProjectListPage() {
    const { openMenu, toggleMenu } = useMenu();

    const {
        isLoading,
        data: { projects },
    } = useContext(OrganizationLayoutContext);

    const newProjectMenuOptions: MenuOptions = {
        type: MenuVariant.Forms,
        title: "Create New Project",
        lists: [
            {
                id: "title",
                label: "Project Title",
                type: MenuFormVariant.Input,
            },
        ],
        onSubmit({ title }: { title: string }) {
            console.log(title);
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
                        openMenu(e, {
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
        <main className="flex flex-col gap-10" onContextMenu={onContextMenu}>
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
            <div className="grid grid-cols-3 gap-5">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="animate-shimmer h-32 w-full rounded-lg bg-dark-800" />)
                ) : (
                    <>
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
