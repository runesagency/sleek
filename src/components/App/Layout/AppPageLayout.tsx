import type { Organization } from "@prisma/client";

import { Button } from "@/components/Forms";
import { MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { IconBell, IconUsers, IconCards, IconPlus, IconSettings, IconMenu2 } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SidebarProps = {
    isOpen: boolean;
};

const Sidebar = ({ isOpen }: SidebarProps) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const { toggleMenu } = useMenu();

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
                onSubmit: (values) => {},
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
            const data = await res.json();

            setOrganizations(data);
        });
    }, []);

    return (
        <aside className={clsx("fixed flex h-full shrink-0 flex-col gap-10 overflow-x-hidden border-r border-r-dark-600 bg-dark-800 py-10 lg:relative lg:w-72", isOpen ? "w-72" : "w-0")}>
            <div className="flex flex-col gap-6 px-5">
                <span className="text-xs font-medium opacity-50">Personal</span>

                <Link href="/app" className="flex items-center gap-3">
                    <IconCards width={20} height={undefined} className="shrink-0" />
                    <p className="text-sm">All Projects</p>
                </Link>

                <button className="flex items-center gap-3">
                    <IconSettings width={20} height={undefined} className="shrink-0" />
                    <p className="text-sm">Your Settings</p>
                </button>
            </div>

            <hr className="border-dark-600" />

            <div className="flex flex-col gap-6 px-5">
                <span className="text-xs font-medium opacity-50">Organization</span>

                {organizations.map(({ name }, index) => (
                    <button key={index} className="flex items-center gap-3">
                        <img src="https://picsum.photos/200" alt={name} className="h-5 w-5 rounded-full" />

                        <p className="text-sm">{name}</p>
                    </button>
                ))}

                <Button.Small className="!py-1" icon={IconPlus} onClick={onCreatingNewOrganization}>
                    Create New Organization
                </Button.Small>
            </div>
        </aside>
    );
};

type AppPageLayoutProps = {
    children: React.ReactNode;
    className?: string;
    useSidebar?: boolean;
};

const AppPageLayout = ({ children, className, useSidebar = true }: AppPageLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <nav className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-10 py-5 md:px-20">
                <div className="flex items-center gap-4">
                    <IconMenu2 className="lg:hidden" height={20} onClick={() => setSidebarOpen(!sidebarOpen)} />

                    <Link href="/app">
                        <img src="/assets/images/logo.svg" alt="Logo" loading="lazy" className="h-6" />
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </nav>

            <main className="flex h-full w-full items-start overflow-auto">
                {useSidebar && <Sidebar isOpen={sidebarOpen} />}

                <section className={clsx("h-full max-h-full w-full flex-1 overflow-auto", className)}>{children}</section>
            </main>
        </main>
    );
};

export default AppPageLayout;
