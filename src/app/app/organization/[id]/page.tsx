"use client";

import type { MenuOptions } from "@/lib/menu/hooks/use-menu";
import type { ApiMethod, APIResult } from "@/lib/types";

import { OrganizationLayoutContext } from "@/app/app/organization/[id]/layout";
import Project from "@/components/App/DataDisplay/Project";
import { MenuAnchor, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconLoader2, IconPlus } from "@tabler/icons";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

export default function OrganizationProjectListPage() {
    const { openMenu, toggleMenu } = useMenu();
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

            fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    organizationId: id,
                }),
            }).then(async (res) => {
                const { result, error }: APIResult<ApiMethod.Project.PostResult> = await res.json();

                if (error) {
                    return toast.error(error.message);
                }

                setData({
                    ...data,
                    projects: [...projects, result],
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
            <div className="grid grid-cols-3 gap-5">
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
                                        <h3 className="text-base font-bold">Creating {projectOnCreate}...</h3>
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
