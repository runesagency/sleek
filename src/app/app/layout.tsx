"use client";

import type { ApiMethod } from "@/lib/types";

import { defaultDashboardLayoutContextValue, DashboardLayoutContext } from "@/app/app/DashboardLayoutContext";
import Sidebar from "@/app/app/Sidebar";
import { Button, Input } from "@/components/Forms";
import Avatar from "@/components/Miscellaneous/Avatar";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";

import { IconBell, IconUsers, IconMenu2, IconLoader2, IconSearch } from "@tabler/icons";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { SWRConfig } from "swr";

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
