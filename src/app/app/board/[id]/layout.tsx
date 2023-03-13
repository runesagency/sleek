"use client";

import type { ApiMethod, ApiResult } from "@/lib/types";

import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import TaskModal from "@/components/TaskModal";
import { ApiRoutes, Routes } from "@/lib/constants";

import { IconArrowBackUp, IconFilter } from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type BoardList = ApiMethod.Board.GetResult["lists"][0];

export type BoardCard = ApiMethod.Board.GetResult["cards"][0];

type BoardLayoutContextProps = {
    isLoading: boolean;
    activeCard?: BoardCard;
    data: ApiMethod.Board.GetResult;
    setLists: (lists: BoardList[]) => void;
    setCards: (cards: BoardCard[]) => void;
    setActiveCard: (card: BoardCard | undefined) => void;
};

const defaultContextValue: BoardLayoutContextProps = {
    isLoading: true,
    data: {
        id: "",
        createdAt: new Date(),
        creatorId: "",
        description: "",
        locked: false,
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        password: "",
        projectId: "",
        users: [],
        lists: [],
        cards: [],
    },
    activeCard: undefined,
    setLists: () => {
        throw new Error("setLists is not defined");
    },
    setCards: () => {
        throw new Error("setCards is not defined");
    },
    setActiveCard: () => {
        throw new Error("setActiveCard is not defined");
    },
};

export const BoardLayoutContext = createContext<BoardLayoutContextProps>(defaultContextValue);

type BoardPageLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function BoardPageLayout({ children, params: { id } }: BoardPageLayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<BoardLayoutContextProps["data"]>(defaultContextValue.data);
    const [activeCard, setActiveCard] = useState<BoardCard | undefined>(undefined);

    const router = useRouter();
    const { projectId, name, users } = data;

    const setLists = useCallback((lists: BoardList[]) => {
        setData((prev) => ({
            ...prev,
            lists,
        }));
    }, []);

    const setCards = useCallback((cards: BoardCard[]) => {
        setData((prev) => ({
            ...prev,
            cards,
        }));
    }, []);

    useEffect(() => {
        fetch(ApiRoutes.Board(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (res) => {
            const { result, error }: ApiResult<ApiMethod.Board.GetResult> = await res.json();

            if (error) {
                toast.error(error.message);
                return router.push(Routes.App);
            }

            setIsLoading(false);
            setData(result);
        });
    }, [id, router]);

    return (
        <BoardLayoutContext.Provider value={{ isLoading, data, activeCard, setLists, setCards, setActiveCard }}>
            <main className="box-border flex h-full w-full flex-col">
                <div className="flex bg-dark-700 px-11">
                    <SwitchButton>About</SwitchButton>
                    <SwitchButton active>View</SwitchButton>
                    <SwitchButton>Members</SwitchButton>
                    <SwitchButton>Settings</SwitchButton>
                </div>

                <div className="flex items-center gap-6 px-11 py-6">
                    {isLoading ? (
                        <>
                            <div className="animate-shimmer h-10 w-40 shrink-0 rounded-lg bg-dark-700" />
                            <div className="animate-shimmer h-10 w-64 shrink-0 rounded-lg bg-dark-700" />
                            <div className="animate-shimmer h-10 w-20 shrink-0 rounded-lg bg-dark-700" />
                        </>
                    ) : (
                        <>
                            <Link href={Routes.Project(projectId)}>
                                <Button.Small icon={IconArrowBackUp} fit>
                                    Back
                                </Button.Small>
                            </Link>

                            <h2 className="ts-2xl">{name}</h2>

                            <MemberList.Large users={users} />

                            <Button.Large icon={IconFilter} fit>
                                Filter
                            </Button.Large>
                        </>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-full w-full px-11 pb-6">
                        <div className="animate-shimmer h-full w-full shrink-0 rounded-lg bg-dark-700" />
                    </div>
                ) : (
                    children
                )}

                <TaskModal />
            </main>
        </BoardLayoutContext.Provider>
    );
}
