"use client";

import type { APIResult } from "@/lib/types";
import type { GetResult } from "@/pages/api/organizations/[id]";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

type OrganizationContextProps = {
    isLoading: boolean;
    organization: GetResult;
};

const defaultContextValue: OrganizationContextProps = {
    isLoading: true,
    organization: {
        id: "",
        createdAt: new Date(),
        creatorId: "",
        customRoles: [],
        description: "",
        externalProjects: [],
        logoAttachmentId: "",
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        ownerId: "",
        projects: [],
        users: [],
    },
};

export const OrganizationContext = createContext<OrganizationContextProps>(defaultContextValue);

type OrganizationPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function OrganizationPageLayout({ children, params: { id } }: OrganizationPageLayoutProps) {
    const [contextValue, setContextValue] = useState<OrganizationContextProps>(defaultContextValue);

    const {
        isLoading,
        organization: { name },
    } = contextValue;

    const router = useRouter();
    const pathname = usePathname();
    const page = pathname?.split("/").pop();
    const pagePath = page === id ? "/" : `/${page}`;

    const links = [
        { name: "About", path: "/about" },
        { name: "Projects", path: "/" },
        { name: "Members", path: "/members" },
        { name: "Settings", path: "/settings" },
    ];

    useEffect(() => {
        fetch(`/api/organizations/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (res) => {
            const { result, error }: APIResult<GetResult> = await res.json();

            if (error) {
                toast.error(error.message);
                return router.push("/app");
            }

            setContextValue({ isLoading: false, organization: result });
        });
    }, [id, router]);

    return (
        <OrganizationContext.Provider value={contextValue}>
            <main className="flex flex-col">
                {isLoading ? (
                    <div className="h-60 w-full animate-pulse bg-dark-700" /> //
                ) : (
                    <img src="https://picsum.photos/1080" alt="banner" className="h-60 w-full object-cover object-center" />
                )}

                <nav className="flex flex-col border-b border-b-dark-600 bg-dark-800 px-12">
                    <div className="flex items-center gap-5 py-5">
                        {isLoading ? (
                            <>
                                <div className="h-12 w-12 animate-pulse rounded-full bg-dark-700" />
                                <div className="h-5 w-full max-w-xs animate-pulse rounded-lg bg-dark-700" />
                            </>
                        ) : (
                            <>
                                <img src="https://picsum.photos/200" alt="logo" className="h-12 w-12 rounded-full object-cover object-center" />
                                <h1 className="text-xl font-bold">{name}</h1>
                            </>
                        )}
                    </div>

                    <div className="flex">
                        {links.map(({ name, path }, index) => (
                            <Link
                                key={index}
                                href={`/app/organization/${id}` + path}
                                className={clsx("ts-sm border-b-2 px-4 py-2 duration-200 hover:border-b-dark-500", pagePath === path ? "border-b-dark-400" : "border-b-transparent")}
                            >
                                {name}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="py-9 px-16 3xl:px-36">{children}</div>
            </main>
        </OrganizationContext.Provider>
    );
}
