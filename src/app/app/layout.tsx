"use client";

import type { APIResult } from "@/lib/types";
import type { GetResult, PostResult } from "@/pages/api/organizations";
import type { Organization } from "@prisma/client";

import { Button, Input } from "@/components/Forms";
import Avatar from "@/components/Miscellaneous/Avatar";
import { MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconBell, IconUsers, IconCards, IconPlus, IconSettings, IconMenu2, IconLoader2, IconSearch } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

type SidebarProps = {
    isOpen: boolean;
};

const Sidebar = ({ isOpen }: SidebarProps) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [organizationOnCreate, setOrganizationOnCreate] = useState<string | null>(null);
    const { toggleMenu } = useMenu();

    // All path are prefixed with /app
    const links = [
        { name: "All Projects", path: "/", icon: IconCards },
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
                onSubmit({ name }: { name: string }) {
                    setOrganizationOnCreate(name);

                    fetch("/api/organizations", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name,
                        }),
                    }).then(async (res) => {
                        const { result, error }: APIResult<PostResult> = await res.json();
                        if (error) return;

                        setOrganizations((prev) => [...prev, result]);
                        setOrganizationOnCreate(null);
                    });
                },
            });
        },
        [toggleMenu]
    );

    useEffect(() => {
        fetch("/api/organizations", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (res) => {
            const { result, error }: APIResult<GetResult> = await res.json();
            if (error) return;

            setOrganizations(result);
        });
    }, []);

    return (
        <aside className={clsx("fixed flex h-full shrink-0 flex-col gap-10 overflow-x-hidden border-r border-r-dark-600 bg-dark-800 py-10 lg:relative lg:w-72", isOpen ? "w-72" : "w-0")}>
            <div className="flex flex-col gap-6 px-5">
                <span className="text-xs font-medium opacity-50">Personal</span>

                {links.map(({ name, path, icon: Icon }, index) => (
                    <Link key={index} href={"/app" + path} className="flex items-center gap-3 duration-200 hover:opacity-75">
                        <Icon width={20} height={undefined} className="shrink-0" />
                        <p className="text-sm">{name}</p>
                    </Link>
                ))}
            </div>

            <hr className="border-dark-600" />

            <div className="flex flex-col gap-6 px-5">
                <span className="text-xs font-medium opacity-50">Organization</span>

                {organizations.map(({ name, id }, index) => (
                    <Link key={index} href={`/app/organization/${id}`} className="flex items-center gap-3 duration-200 hover:opacity-75">
                        <img src="https://picsum.photos/200" alt={name} className="h-5 w-5 rounded-full" />

                        <p className="text-sm">{name}</p>
                    </Link>
                ))}

                {organizationOnCreate && (
                    <button className="flex items-center gap-3">
                        <IconLoader2 height={20} width={20} className="animate-spin" />
                        <p className="text-sm">{organizationOnCreate}</p>
                    </button>
                )}

                <Button.Small className="!py-1" icon={IconPlus} onClick={onCreatingNewOrganization}>
                    Create New Organization
                </Button.Small>
            </div>
        </aside>
    );
};

type DashboardLayoutProps = {
    children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { data } = useSession();

    const pathWithoutSidebar = [
        "/board", //
    ];

    const isUsingSidebar = pathname && !pathWithoutSidebar.includes(pathname);

    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <nav className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-10 py-5 md:px-20">
                <div className="flex items-center gap-4">
                    <IconMenu2 className="lg:hidden" height={20} onClick={() => setSidebarOpen(!sidebarOpen)} />

                    <Link href="/app">
                        <img src="/assets/images/logo.svg" alt="Logo" loading="lazy" className="h-6" />
                    </Link>
                </div>

                <div className="flex items-center gap-7">
                    <Input.Small
                        icon={IconSearch}
                        placeholder="Search"
                        className={{
                            icon: "!py-2",
                            input: "!py-2",
                        }}
                    />

                    <IconUsers className="h-5 shrink-0" />

                    <IconBell className="h-5 shrink-0" />

                    {data && (
                        <Button.Large fit>
                            <Avatar seed={data.user?.email || ""} className="h-5 w-5" />
                            <p className="ts-base">{data.user?.name || ""}</p>
                        </Button.Large>
                    )}
                </div>
            </nav>

            <main className="flex h-full w-full items-start overflow-auto">
                {isUsingSidebar && <Sidebar isOpen={sidebarOpen} />}

                <section className="h-full max-h-full w-full flex-1 overflow-auto">{children}</section>
            </main>
        </main>
    );
}