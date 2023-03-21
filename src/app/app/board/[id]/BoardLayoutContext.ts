import type { ApiMethod } from "@/lib/types";

import { createContext } from "react";

export type BoardList = ApiMethod.Board.GetResult["lists"][0];

export type BoardCard = ApiMethod.Board.GetResult["cards"][0];

export type BoardLayoutContextProps = {
    isLoading: boolean;
    activeCard?: BoardCard;
    data: ApiMethod.Board.GetResult;
    setLists: (lists: BoardList[]) => void;
    setCards: (cards: BoardCard[]) => void;
    setActiveCard: (card: BoardCard | undefined) => void;
    onCreateNewCard: (name: string, listId: string, order: number) => Promise<void>;
};

export const defaultBoardLayoutContextValue: BoardLayoutContextProps = {
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
    onCreateNewCard: () => {
        throw new Error("onCreateNewCard is not defined");
    },
};

export const BoardLayoutContext = createContext<BoardLayoutContextProps>(defaultBoardLayoutContextValue);
