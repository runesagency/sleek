import type { ApiMethod, ApiResult } from "@/lib/types";

import { DashboardLayoutContext } from "@/app/app/DashboardLayoutContext";
import { Button } from "@/components/Forms";
import { ApiRoutes, Routes } from "@/lib/constants";
import { MenuAlignment, MenuAnchor, MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IconCards, IconLoader2, IconPlus, IconSettings, IconUsers } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

type OrganizationButtonProps = {
    id: string;
    name: string;
};

const OrganizationButton = ({ id, name }: OrganizationButtonProps) => {
    const { openMenu } = useMenu();

    const onContextMenu = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            openMenu(e, {
                type: MenuVariant.Context,
                alignment: MenuAlignment.Start,
                direction: MenuDirection.Right,
                anchor: MenuAnchor.Cursor,
                lists: [
                    {
                        icon: IconCards,
                        name: "See Projects",
                        href: Routes.Organization(id),
                    },
                    {
                        icon: IconUsers,
                        name: "See Members",
                        href: Routes.Organization(id) + "/members",
                    },
                    {
                        icon: IconSettings,
                        name: "Edit Organization",
                        href: Routes.Organization(id) + "/settings",
                    },
                ],
            });
        },
        [id, openMenu]
    );

    return (
        <Link href={Routes.Organization(id)} className="flex items-center gap-3 duration-200 hover:opacity-75" onContextMenu={onContextMenu}>
            <img src="https://picsum.photos/200" alt={name} className="h-5 w-5 rounded-full" />
            <p className="ts-sm">{name}</p>
        </Link>
    );
};

type SidebarProps = {
    isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
    const { isLoading, data, setData } = useContext(DashboardLayoutContext);
    const [organizationOnCreate, setOrganizationOnCreate] = useState<string | null>(null);
    const [autoAnimateRef] = useAutoAnimate();
    const { toggleMenu } = useMenu();

    const links = [
        { name: "All Organizations", path: Routes.App, icon: IconCards },
        { name: "Your Settings", path: "#", icon: IconSettings },
    ];

    const onCreatingNewOrganization = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            toggleMenu(e, {
                type: MenuVariant.Forms,
                direction: MenuDirection.Bottom,
                offset: { y: 10 },
                title: "Create New Organization",
                lists: [
                    {
                        id: "name",
                        label: "Name",
                        type: MenuFormVariant.Input,
                    },
                ],
                onSubmit: async ({ name }: { name: string }) => {
                    setOrganizationOnCreate(name);

                    const res = await fetch(ApiRoutes.OrganizationCollections, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name,
                        }),
                    });

                    const { result, error }: ApiResult<ApiMethod.OrganizationCollections.PostResult> = await res.json();

                    if (error) {
                        return toast.error(error.message);
                    }

                    setData([...data, result]);
                    setOrganizationOnCreate(null);
                },
            });
        },
        [data, setData, toggleMenu]
    );

    return (
        <aside className={clsx("fixed flex h-full shrink-0 flex-col gap-10 overflow-x-hidden border-r border-r-dark-600 bg-dark-800 py-10 lg:relative lg:w-72", isOpen ? "w-72" : "w-0")}>
            <div className="flex flex-col gap-6 px-5">
                <span className="ts-xs font-medium opacity-50">Personal</span>

                {links.map(({ name, path, icon: Icon }, index) => (
                    <Link key={index} href={path} className="flex items-center gap-3 duration-200 hover:opacity-75">
                        <Icon width={20} height={undefined} className="shrink-0" />
                        <p className="ts-sm">{name}</p>
                    </Link>
                ))}
            </div>

            <hr className="border-dark-600" />

            <div ref={autoAnimateRef} className="flex flex-col gap-6 px-5">
                <span className="ts-xs font-medium opacity-50">Organization</span>

                {isLoading
                    ? [...Array(3)].map((_, index) => <div key={index} className="animate-shimmer h-5 w-full rounded-full bg-dark-700" />)
                    : data.map((organization, index) => <OrganizationButton key={index} {...organization} />)}

                {organizationOnCreate && (
                    <button className="flex items-center gap-3">
                        <IconLoader2 height={20} width={20} className="animate-spin" />
                        <p className="ts-sm">{organizationOnCreate}</p>
                    </button>
                )}

                <Button.Small className="!py-1" icon={IconPlus} onClick={onCreatingNewOrganization}>
                    Create New Organization
                </Button.Small>
            </div>
        </aside>
    );
}
