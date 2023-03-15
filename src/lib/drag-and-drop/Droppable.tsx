import type { DragEndEvent, DragEnterEvent, DragLeaveEvent } from "@/lib/drag-and-drop";

import { contextConstants } from "@/lib/drag-and-drop";

import { useEffect, useRef } from "react";

export enum SortableDirection {
    Vertical = "vertical",
    Horizontal = "horizontal",
    Auto = "auto",
}

export const droppableConstants = {
    dataAttribute: {
        droppable: "data-droppable",
        droppableId: "data-droppable-id",
        sortable: "data-sortable",
        sortableDirection: "data-sortable-direction",
        accepts: "data-accepts",
        collide: "data-collide",
    },
};

export type DroppableProvided<T> = {
    ref: React.RefObject<T>;
};

export type DroppableProps<T> = {
    id: string;
    accepts?: string[];
    collide?: boolean;
    onDragEnter?: (event: DragEnterEvent) => void;
    onDragLeave?: (event: DragLeaveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    children: (provided: DroppableProvided<T>) => JSX.Element;
} & (
    | {
          sortable: true;
          sortableDirection: SortableDirection;
      }
    | {
          sortable: false;
          sortableDirection: never;
      }
);

export default function Droppable<T extends HTMLElement>({ id, onDragEnter, onDragLeave, onDragEnd, children, ...options }: DroppableProps<T>) {
    const { sortable, sortableDirection, accepts, collide } = options;

    const ref = useRef<T>(null);

    useEffect(() => {
        const current = ref.current;

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
            current.setAttribute(droppableConstants.dataAttribute.droppable, "true");
            current.setAttribute(droppableConstants.dataAttribute.droppableId, id);

            if (sortable) {
                current.setAttribute(droppableConstants.dataAttribute.sortable, "true");
                current.setAttribute(droppableConstants.dataAttribute.sortableDirection, sortableDirection);
            } else {
                current.removeAttribute(droppableConstants.dataAttribute.sortable);
                current.removeAttribute(droppableConstants.dataAttribute.sortableDirection);
            }

            if (accepts) {
                current.setAttribute(droppableConstants.dataAttribute.accepts, accepts.join(","));
            } else {
                current.removeAttribute(droppableConstants.dataAttribute.accepts);
            }

            if (collide) {
                current.setAttribute(droppableConstants.dataAttribute.collide, "true");
            } else {
                current.removeAttribute(droppableConstants.dataAttribute.collide);
            }

            current.addEventListener(contextConstants.events.dragEnter, onDragEnterEvent);
            current.addEventListener(contextConstants.events.dragLeave, onDragLeaveEvent);
            current.addEventListener(contextConstants.events.dragEnd, onDragEndEvent);
        }

        return () => {
            if (current) {
                current.removeAttribute(droppableConstants.dataAttribute.droppable);
                current.removeAttribute(droppableConstants.dataAttribute.droppableId);
                current.removeAttribute(droppableConstants.dataAttribute.sortable);
                current.removeAttribute(droppableConstants.dataAttribute.sortableDirection);
                current.removeAttribute(droppableConstants.dataAttribute.accepts);
                current.removeAttribute(droppableConstants.dataAttribute.collide);

                current.removeEventListener(contextConstants.events.dragEnter, onDragEnterEvent);
                current.removeEventListener(contextConstants.events.dragLeave, onDragLeaveEvent);
                current.removeEventListener(contextConstants.events.dragEnd, onDragEndEvent);
            }
        };
    }, [accepts, collide, id, onDragEnd, onDragEnter, onDragLeave, ref, sortable, sortableDirection]);

    return children({ ref });
}
