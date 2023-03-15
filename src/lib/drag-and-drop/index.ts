import DragDropContext from "@/lib/drag-and-drop/DragDropContext";
import Draggable from "@/lib/drag-and-drop/Draggable";
import Droppable from "@/lib/drag-and-drop/Droppable";

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

export * from "./DragDropContext";
export * from "./Draggable";
export * from "./Droppable";

export { DragDropContext, Droppable, Draggable };
