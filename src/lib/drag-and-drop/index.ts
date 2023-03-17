import DragDropProvider from "@/lib/drag-and-drop/DragDropProvider";
import Draggable from "@/lib/drag-and-drop/Draggable";
import Droppable from "@/lib/drag-and-drop/Droppable";

import { createContext } from "react";

export type DragEvent = {
    dragged: {
        id: string;
        type: string;
    };
    dropped: {
        id: string;
        sortable: boolean;
        index: number;
    };
};

export type DragStartEvent = Pick<DragEvent, "dragged">;
export type DragCancelEvent = DragStartEvent;
export type DragEnterEvent = DragEvent;
export type DragLeaveEvent = DragEvent;
export type DragEndEvent = DragEvent;

export * from "./DragDropProvider";
export * from "./Draggable";
export * from "./Droppable";

export type DroppableContextProps = {
    id?: string;
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
};

export const DroppableContext = createContext<DroppableContextProps>({});

export type DragDropContextProps = {
    id?: string;
    dragged?: Pick<DragEvent, "dragged">["dragged"];
    hovered?: Pick<DragEvent, "dropped">["dropped"];
    onDragStart?: (event: DragStartEvent) => void;
    onDragCancel?: (event: DragCancelEvent) => void;
    onDragEnter?: (event: DragEnterEvent) => void;
    onDragLeave?: (event: DragLeaveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
};

export const DragDropContext = createContext<DragDropContextProps>({});

export { DragDropProvider, Droppable, Draggable };
