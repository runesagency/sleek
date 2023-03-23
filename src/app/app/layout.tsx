"use client";

import type { ApiResult, ApiMethod } from "@/lib/types";

import { defaultDashboardLayoutContextValue, DashboardLayoutContext } from "@/app/app/DashboardLayoutContext";
import { Button, Input } from "@/components/Forms";
import Avatar from "@/components/Miscellaneous/Avatar";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";
import { MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IconBell, IconUsers, IconCards, IconPlus, IconSettings, IconMenu2, IconLoader2, IconSearch } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useState, useContext } from "react";
import { toast } from "react-toastify";
import { SWRConfig } from "swr";

type SidebarProps = {
    isOpen: boolean;
};

const Sidebar = ({ isOpen }: SidebarProps) => {
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
                    : data.map(({ name, id }, index) => (
                          <Link key={index} href={Routes.Organization(id)} className="flex items-center gap-3 duration-200 hover:opacity-75">
                              <img src="https://picsum.photos/200" alt={name} className="h-5 w-5 rounded-full" />
                              <p className="ts-sm">{name}</p>
                          </Link>
                      ))}

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
};

type DashboardLayoutProps = {
    children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data, error, isLoading, mutate: setData } = useRequest<ApiMethod.OrganizationCollections.GetResult>(ApiRoutes.OrganizationCollections, defaultDashboardLayoutContextValue.data);
    const { data: sessionData } = useSession();
    const router = useRouter();
    const currentSegment = useSelectedLayoutSegment();

    const segmentWithoutSidebar = ["board"];
    const isUsingSidebar = !segmentWithoutSidebar.find((segment) => currentSegment === segment);

    if (error) {
        toast.error(error.message);
        return router.push(Routes.Home);
    }

    return (
        <SWRConfig value={{ revalidateOnFocus: true, revalidateOnReconnect: true }}>
            <DashboardLayoutContext.Provider value={{ isLoading, data, setData }}>
                <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
                    <nav className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-10 py-3 md:px-20">
                        <div className="flex items-center gap-4">
                            <IconMenu2 className="lg:hidden" height={20} onClick={() => setSidebarOpen(!sidebarOpen)} />

                            <Link href={Routes.App}>
                                <img src="/assets/images/logo.svg" alt="Logo" loading="lazy" className="h-6" />
                            </Link>
                        </div>

                        <div className="flex items-stretch gap-7">
                            <Input.Small
                                icon={IconSearch}
                                placeholder="Search"
                                className={{
                                    icon: "!py-2",
                                    input: "!py-2",
                                }}
                            />

                            <IconUsers className="my-auto h-5 shrink-0" />

                            <IconBell className="my-auto h-5 shrink-0" />

                            {sessionData && sessionData.user ? (
                                <Button.Large fit>
                                    <Avatar seed={sessionData.user.name || ""} className="h-5 w-5" />
                                    <p className="ts-sm">{sessionData.user.name || ""}</p>
                                </Button.Large>
                            ) : (
                                <Button.Large fit className="animate-shimmer">
                                    <IconLoader2 height={20} width={20} className="animate-spin" />
                                    <p className="ts-sm">Loading...</p>
                                </Button.Large>
                            )}
                        </div>
                    </nav>

                    <main className="flex h-full w-full items-start overflow-auto">
                        {isUsingSidebar && <Sidebar isOpen={sidebarOpen} />}

                        <section className="h-full max-h-full w-full flex-1 overflow-auto">{children}</section>
                    </main>
                </main>
            </DashboardLayoutContext.Provider>
        </SWRConfig>
    );
}
