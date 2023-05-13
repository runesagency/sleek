"use client";

import type { ApiMethod } from "@/lib/types";

import { defaultProjectLayoutContextValue, ProjectLayoutContext } from "@/app/app/project/[id]/ProjectLayoutContext";
import { Button } from "@/components/Forms";
import { ApiRoutes, Routes } from "@/lib/constants";
import { useRequest } from "@/lib/hooks";

import { IconArrowBackUp } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type ProjectPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function ProjectPageLayout({ children, params: { id } }: ProjectPageLayoutProps) {
    const { data, error, isLoading, mutate: setData } = useRequest<ApiMethod.Project.GetResult>(ApiRoutes.Project(id), defaultProjectLayoutContextValue.data);
    const router = useRouter();

    const { name, description, organizationId } = data;

    if (error) {
        toast.error(error.message);
        return router.push(Routes.App);
    }

    return (
        <ProjectLayoutContext.Provider value={{ isLoading, data, setData }}>
            <main className="flex h-full flex-col gap-6 px-16 py-9 3xl:px-36">
                {!isLoading && (
                    <Link href={Routes.Organization(organizationId)}>
                        <Button.Small icon={IconArrowBackUp} fit>
                            Back to Organization
                        </Button.Small>
                    </Link>
                )}

                <div className="flex max-w-md flex-col gap-4">
                    {isLoading ? (
                        <>
                            <div className="animate-shimmer h-10 w-48 rounded-lg bg-dark-700" />
                            <div className="flex flex-col gap-2">
                                <div className="animate-shimmer h-5 w-full max-w-xs rounded-lg bg-dark-700" />
                                <div className="animate-shimmer h-5 w-64 rounded-lg bg-dark-700" />
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="heading-4">{name}</h1>
                            {description && <p className="ts-sm">{description}</p>}
                        </>
                    )}
                </div>

                {children}
            </main>
        </ProjectLayoutContext.Provider>
    );
}
