"use client";

import type { Activity, Attachment, Board, Card, CardAttachment, CardChecklist, CardChecklistTask, CardLabel, CardTimer, Label, List, Project, User } from "@prisma/client";

import MemberList from "@/components/DataDisplay/MemberList";
import { SwitchButton, Button } from "@/components/Forms";
import TaskModal from "@/components/TaskModal";

import { IconArrowBackUp, IconFilter } from "@tabler/icons";
import Link from "next/link";
import { createContext, useEffect, useState } from "react";

export type BoardList = List;

export type BoardCard = Card & {
    users: User[];
    timers: CardTimer[];
    creator: User;
    cover: Attachment;
    labels: (CardLabel & {
        label: Label;
    })[];
    checklists: (CardChecklist & {
        tasks: CardChecklistTask[];
    })[];
    attachments: (CardAttachment & {
        attachment: Attachment;
    })[];
    activities: (Activity & {
        user: User;
    })[];
};

type BoardLayoutContextProps = {
    isLoading: boolean;
    project: Project;
    lists: BoardList[];
    cards: BoardCard[];
    activeCard?: BoardCard;
    board: Board & {
        users: User[];
    };
    setLists: (lists: BoardList[]) => void;
    setCards: (cards: BoardCard[]) => void;
    setActiveCard: (card: BoardCard | undefined) => void;
};

const defaultContextValue: BoardLayoutContextProps = {
    isLoading: true,
    project: {
        id: "",
        createdAt: new Date(),
        creatorId: "",
        description: "",
        coverAttachmentId: "",
        dueDate: new Date(),
        logoAttachmentId: "",
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        password: "",
        organizationId: "",
        startDate: new Date(),
    },
    board: {
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
    },
    lists: [],
    cards: [],
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

export default function BoardPageLayout({ children, params: { id: boardId } }: BoardPageLayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState<BoardLayoutContextProps["project"]>(defaultContextValue.project);
    const [board, setBoard] = useState<BoardLayoutContextProps["board"]>(defaultContextValue.board);
    const [lists, setLists] = useState<BoardList[]>([]);
    const [cards, setCards] = useState<BoardCard[]>([]);
    const [activeCard, setActiveCard] = useState<BoardCard | undefined>(undefined);

    useEffect(() => {
        // TODO: Fetch data
    }, []);

    return (
        <BoardLayoutContext.Provider value={{ isLoading, project, board, lists, cards, activeCard, setLists, setCards, setActiveCard }}>
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
                            <Link href={`/app/project/${project.id}`}>
                                <Button.Small icon={IconArrowBackUp} fit>
                                    Back
                                </Button.Small>
                            </Link>

                            <h2 className="ts-2xl">{board.name}</h2>

                            <MemberList.Large users={board.users} />

                            <Button.Large icon={IconFilter} fit>
                                Filter
                            </Button.Large>
                        </>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-full w-full px-11 pb-6">
                        <div className="animate-shimmer h-full w-full shrink-0 rounded-lg bg-dark-700" />{" "}
                    </div>
                ) : (
                    children
                )}

                <TaskModal />
            </main>
        </BoardLayoutContext.Provider>
    );
}
