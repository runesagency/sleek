import { useEffect, useRef } from "react";

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

export type DragCancelEvent = Pick<DragEvent, "dragged">;

export const constants = {
    dataAttribute: {
        dragDropContext: "data-drag-drop-context",
    },
    events: {
        dragStart: "drag-start",
        dragEnd: "drag-end",
        dragCancel: "drag-cancel",
    },
};

export default function useDragDropContext<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    const dragEndHandler = useRef<(event: DragEvent) => void>(() => true);

    const onDragEnd = (handler: (event: DragEvent) => void) => {
        dragEndHandler.current = handler;
    };

    useEffect(() => {
        const current = ref.current;

        const onDragEnd = ((event: CustomEvent<DragEvent>) => {
            dragEndHandler.current(event.detail);
        }) as EventListener;

        if (current) {
            current.setAttribute(constants.dataAttribute.dragDropContext, "true");

            current.addEventListener(constants.events.dragEnd, onDragEnd);
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.dragDropContext);

                current.removeEventListener(constants.events.dragEnd, onDragEnd);
            }
        };
    }, [ref]);

    return {
        ref,
        onDragEnd,
    };
}
