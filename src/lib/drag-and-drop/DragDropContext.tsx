import type { DragStartEvent, DragCancelEvent, DragEnterEvent, DragLeaveEvent, DragEndEvent } from ".";

import { useEffect, useRef } from "react";

export const contextConstants = {
    dataAttribute: {
        dragDropContext: "data-drag-drop-context",
    },
    events: {
        dragStart: "drag-start",
        dragCancel: "drag-cancel",
        dragEnter: "drag-enter",
        dragLeave: "drag-leave",
        dragEnd: "drag-end",
    },
};

export type DragDropContextProvided<T> = {
    ref: React.RefObject<T>;
};

export type DragDropContextProps<T> = {
    onDragStart?: (event: DragStartEvent) => void;
    onDragCancel?: (event: DragCancelEvent) => void;
    onDragEnter?: (event: DragEnterEvent) => void;
    onDragLeave?: (event: DragLeaveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    children: (provided: DragDropContextProvided<T>) => JSX.Element;
};

export default function DragDropContext<T extends HTMLElement>({ children, onDragStart, onDragCancel, onDragEnter, onDragLeave, onDragEnd }: DragDropContextProps<T>) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const current = ref.current;

        const onDragStartEvent = ((event: CustomEvent<DragStartEvent>) => {
            onDragStart?.(event.detail);
        }) as EventListener;

        const onDragCancelEvent = ((event: CustomEvent<DragCancelEvent>) => {
            onDragCancel?.(event.detail);
        }) as EventListener;

        const onDragEnterEvent = ((event: CustomEvent<DragEnterEvent>) => {
            onDragEnter?.(event.detail);
        }) as EventListener;

        const onDragLeaveEvent = ((event: CustomEvent<DragLeaveEvent>) => {
            onDragLeave?.(event.detail);
        }) as EventListener;

        const onDragEndEvent = ((event: CustomEvent<DragEndEvent>) => {
            onDragEnd?.(event.detail);
        }) as EventListener;

        if (current) {
            current.setAttribute(contextConstants.dataAttribute.dragDropContext, "true");

            current.addEventListener(contextConstants.events.dragStart, onDragStartEvent);
            current.addEventListener(contextConstants.events.dragCancel, onDragCancelEvent);
            current.addEventListener(contextConstants.events.dragEnter, onDragEnterEvent);
            current.addEventListener(contextConstants.events.dragLeave, onDragLeaveEvent);
            current.addEventListener(contextConstants.events.dragEnd, onDragEndEvent);
        }

        return () => {
            if (current) {
                current.removeAttribute(contextConstants.dataAttribute.dragDropContext);

                current.removeEventListener(contextConstants.events.dragStart, onDragStartEvent);
                current.removeEventListener(contextConstants.events.dragCancel, onDragCancelEvent);
                current.removeEventListener(contextConstants.events.dragEnter, onDragEnterEvent);
                current.removeEventListener(contextConstants.events.dragLeave, onDragLeaveEvent);
                current.removeEventListener(contextConstants.events.dragEnd, onDragEndEvent);
            }
        };
    }, [onDragCancel, onDragEnd, onDragEnter, onDragLeave, onDragStart, ref]);

    return children({ ref });
}
