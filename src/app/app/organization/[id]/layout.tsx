"use client";

import type { ApiMethod } from "@/lib/types";

import { defaultOrganizationLayoutContextValue, OrganizationLayoutContext } from "@/app/app/organization/[id]/OrganizationLayoutContext";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";

import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { toast } from "react-toastify";

type OrganizationPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function OrganizationPageLayout({ children, params: { id } }: OrganizationPageLayoutProps) {
    const { data, error, isLoading, mutate: setData } = useRequest<ApiMethod.Organization.GetResult>(ApiRoutes.Organization(id), defaultOrganizationLayoutContextValue.data);
    const router = useRouter();
    const currentSegment = useSelectedLayoutSegment();

    const { name } = data;

    const links = [
        { name: "About", segment: "about" },
        { name: "Projects", segment: null },
        { name: "Members", segment: "members" },
        { name: "Settings", segment: "settings" },
    ];

    if (error) {
        toast.error(error.message);
        return router.push(Routes.App);
    }

    return (
        <OrganizationLayoutContext.Provider value={{ isLoading, data, setData }}>
            <main className="flex h-full flex-col">
                {isLoading ? (
                    <div className="animate-shimmer h-60 w-full shrink-0 bg-dark-700" /> //
                ) : (
                    <img src="https://picsum.photos/1080" alt="banner" className="h-60 w-full shrink-0 object-cover object-center" />
                )}

                <nav className="flex shrink-0 flex-col border-b border-b-dark-600 bg-dark-800 px-12">
                    <div className="flex items-center gap-5 py-5">
                        {isLoading ? (
                            <>
                                <div className="animate-shimmer h-12 w-12 rounded-full bg-dark-700" />
                                <div className="animate-shimmer h-5 w-full max-w-xs rounded-lg bg-dark-700" />
                            </>
                        ) : (
                            <>
                                <img src="https://picsum.photos/200" alt="logo" className="h-12 w-12 rounded-full object-cover object-center" />
                                <h1 className="ts-xl font-bold">{name}</h1>
                            </>
                        )}
                    </div>

                    <div className="flex">
                        {links.map(({ name, segment }, index) => (
                            <Link
                                key={index}
                                href={Routes.Organization(id) + "/" + (segment ?? "")}
                                className={clsx("ts-sm border-b-2 px-4 py-2 duration-200 hover:border-b-dark-500", segment === currentSegment ? "border-b-dark-400" : "border-b-transparent")}
                            >
                                {name}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="h-full py-9 px-16 3xl:px-36">{children}</div>
            </main>
        </OrganizationLayoutContext.Provider>
    );
}
