"use client";

import type { ApiMethod, ApiResult } from "@/lib/types";

import { Button } from "@/components/Forms";

import { IconArrowBackUp } from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

type ProjectLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.Project.GetResult;
    setData: (data: ApiMethod.Project.GetResult) => void;
};

const defaultContextValue: ProjectLayoutContextProps = {
    isLoading: true,
    data: {
        id: "",
        boards: [],
        coverAttachmentId: "",
        createdAt: new Date(),
        creatorId: "",
        description: "",
        dueDate: new Date(),
        logoAttachmentId: "",
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        organizationId: "",
        password: "",
        startDate: new Date(),
        users: [],
    },
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const ProjectLayoutContext = createContext<ProjectLayoutContextProps>(defaultContextValue);

type ProjectPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function ProjectPageLayout({ children, params: { id } }: ProjectPageLayoutProps) {
    const [contextValue, setContextValue] = useState<ProjectLayoutContextProps>(defaultContextValue);

    const {
        isLoading,
        data: { name, description, organizationId },
    } = contextValue;

    const router = useRouter();

    useEffect(() => {
        fetch(`/api/projects/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (res) => {
            const { result, error }: ApiResult<ApiMethod.Project.GetResult> = await res.json();

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
        <ProjectLayoutContext.Provider value={contextValue}>
            <main className="flex h-full flex-col gap-6 py-9 px-16 3xl:px-36">
                {!isLoading && (
                    <Link href={`/app/organization/${organizationId}`}>
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
