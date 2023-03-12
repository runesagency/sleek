"use client";

import type { ApiResult, ApiMethod } from "@/lib/types";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

type OrganizationLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.Organization.GetResult;
    setData: (data: ApiMethod.Organization.GetResult) => void;
};

const defaultContextValue: OrganizationLayoutContextProps = {
    isLoading: true,
    data: {
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
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const OrganizationLayoutContext = createContext<OrganizationLayoutContextProps>(defaultContextValue);

type OrganizationPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function OrganizationPageLayout({ children, params: { id } }: OrganizationPageLayoutProps) {
    const [contextValue, setContextValue] = useState<OrganizationLayoutContextProps>(defaultContextValue);

    const {
        isLoading,
        data: { name },
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
            const { result, error }: ApiResult<ApiMethod.Organization.GetResult> = await res.json();

            if (error) {
                toast.error(error.message);
                return router.push("/app");
            }

            setContextValue({
                isLoading: false,
                data: result,
                setData: (data) => {
                    setContextValue((prev) => ({
                        ...prev,
                        data,
                    }));
                },
            });
        });
    }, [id, router]);

    return (
        <OrganizationLayoutContext.Provider value={contextValue}>
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

                <div className="h-full py-9 px-16 3xl:px-36">{children}</div>
            </main>
        </OrganizationLayoutContext.Provider>
    );
}
